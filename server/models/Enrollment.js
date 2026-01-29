import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
});

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "completed", "dropped", "suspended"],
      default: "active",
    },
    progress: {
      completedMaterials: [progressSchema],
      overallProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      lastAccessedAt: {
        type: Date,
        default: Date.now,
      },
      totalTimeSpent: {
        type: Number, // in minutes
        default: 0,
      },
    },
    grades: {
      assignments: [
        {
          assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          score: {
            type: Number,
            min: 0,
            max: 100,
          },
          submittedAt: Date,
          gradedAt: Date,
          feedback: String,
        },
      ],
      quizzes: [
        {
          quizId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          score: {
            type: Number,
            min: 0,
            max: 100,
          },
          attempts: {
            type: Number,
            default: 1,
          },
          completedAt: Date,
        },
      ],
      finalGrade: {
        type: Number,
        min: 0,
        max: 100,
      },
      letterGrade: {
        type: String,
        enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"],
      },
    },
    certificate: {
      isEarned: {
        type: Boolean,
        default: false,
      },
      earnedAt: Date,
      certificateId: String,
      downloadUrl: String,
    },
    notes: {
      student: String,
      instructor: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index to ensure unique enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Indexes for better query performance
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Virtual for completion percentage
enrollmentSchema.virtual("completionPercentage").get(function () {
  return this.progress.overallProgress;
});

// Instance method to update progress
enrollmentSchema.methods.updateProgress = async function (
  moduleId,
  materialId,
  timeSpent = 0,
  score = null,
) {
  // Remove existing progress for this material
  this.progress.completedMaterials = this.progress.completedMaterials.filter(
    (progress) => !progress.materialId.equals(materialId),
  );

  // Add new progress entry
  const progressEntry = {
    moduleId,
    materialId,
    timeSpent,
    completedAt: new Date(),
  };

  if (score !== null) {
    progressEntry.score = score;
  }

  this.progress.completedMaterials.push(progressEntry);
  this.progress.totalTimeSpent += timeSpent;
  this.progress.lastAccessedAt = new Date();

  // Calculate overall progress
  await this.populate("course");
  const totalMaterials = this.course.totalMaterials;
  const completedMaterials = this.progress.completedMaterials.length;
  this.progress.overallProgress =
    totalMaterials > 0
      ? Math.round((completedMaterials / totalMaterials) * 100)
      : 0;

  // Check if course is completed
  if (this.progress.overallProgress >= 100 && this.status === "active") {
    this.status = "completed";

    // Check if certificate should be awarded
    if (this.course.certificateSettings.isEnabled) {
      const passingGrade = this.course.certificateSettings.passingGrade || 70;
      if (this.grades.finalGrade >= passingGrade) {
        this.certificate.isEarned = true;
        this.certificate.earnedAt = new Date();
        this.certificate.certificateId = `CERT-${this.course._id}-${this.student}-${Date.now()}`;
      }
    }
  }

  return this.save();
};

// Instance method to add assignment grade
enrollmentSchema.methods.addAssignmentGrade = function (
  assignmentId,
  score,
  feedback = "",
) {
  // Remove existing grade for this assignment
  this.grades.assignments = this.grades.assignments.filter(
    (grade) => !grade.assignmentId.equals(assignmentId),
  );

  // Add new grade
  this.grades.assignments.push({
    assignmentId,
    score,
    gradedAt: new Date(),
    feedback,
  });

  // Recalculate final grade
  this.calculateFinalGrade();

  return this.save();
};

// Instance method to add quiz grade
enrollmentSchema.methods.addQuizGrade = function (quizId, score, attempts = 1) {
  const existingQuiz = this.grades.quizzes.find((quiz) =>
    quiz.quizId.equals(quizId),
  );

  if (existingQuiz) {
    existingQuiz.score = Math.max(existingQuiz.score, score); // Keep highest score
    existingQuiz.attempts += attempts;
    existingQuiz.completedAt = new Date();
  } else {
    this.grades.quizzes.push({
      quizId,
      score,
      attempts,
      completedAt: new Date(),
    });
  }

  // Recalculate final grade
  this.calculateFinalGrade();

  return this.save();
};

// Instance method to calculate final grade
enrollmentSchema.methods.calculateFinalGrade = function () {
  const assignmentScores = this.grades.assignments
    .map((a) => a.score)
    .filter((s) => s !== undefined);
  const quizScores = this.grades.quizzes
    .map((q) => q.score)
    .filter((s) => s !== undefined);

  if (assignmentScores.length === 0 && quizScores.length === 0) {
    this.grades.finalGrade = 0;
    this.grades.letterGrade = "F";
    return;
  }

  // Simple average calculation (can be made more sophisticated)
  const allScores = [...assignmentScores, ...quizScores];
  const average =
    allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

  this.grades.finalGrade = Math.round(average);

  // Calculate letter grade
  if (average >= 97) this.grades.letterGrade = "A+";
  else if (average >= 93) this.grades.letterGrade = "A";
  else if (average >= 90) this.grades.letterGrade = "A-";
  else if (average >= 87) this.grades.letterGrade = "B+";
  else if (average >= 83) this.grades.letterGrade = "B";
  else if (average >= 80) this.grades.letterGrade = "B-";
  else if (average >= 77) this.grades.letterGrade = "C+";
  else if (average >= 73) this.grades.letterGrade = "C";
  else if (average >= 70) this.grades.letterGrade = "C-";
  else if (average >= 60) this.grades.letterGrade = "D";
  else this.grades.letterGrade = "F";
};

// Static method to get student enrollments
enrollmentSchema.statics.getStudentEnrollments = function (
  studentId,
  status = null,
) {
  const query = { student: studentId };
  if (status) query.status = status;

  return this.find(query)
    .populate("course", "title description thumbnail instructor category level")
    .populate("course.instructor", "firstName lastName")
    .sort({ enrolledAt: -1 });
};

// Static method to get course enrollments
enrollmentSchema.statics.getCourseEnrollments = function (
  courseId,
  status = null,
) {
  const query = { course: courseId };
  if (status) query.status = status;

  return this.find(query)
    .populate("student", "firstName lastName email avatar")
    .sort({ enrolledAt: -1 });
};

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;

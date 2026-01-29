import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        mimeType: String,
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      feedback: String,
      gradedAt: Date,
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    status: {
      type: String,
      enum: ["submitted", "graded", "returned"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  },
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      maxlength: [200, "Assignment title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Assignment description is required"],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    maxPoints: {
      type: Number,
      default: 100,
      min: 1,
    },
    allowLateSubmissions: {
      type: Boolean,
      default: false,
    },
    latePenalty: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    submissionType: {
      type: String,
      enum: ["text", "file", "both"],
      default: "both",
    },
    allowedFileTypes: [String],
    maxFileSize: {
      type: Number,
      default: 10, // MB
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    submissions: [submissionSchema],
    rubric: {
      criteria: [
        {
          name: String,
          description: String,
          maxPoints: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for submission count
assignmentSchema.virtual("submissionCount").get(function () {
  return this.submissions.length;
});

// Virtual for graded count
assignmentSchema.virtual("gradedCount").get(function () {
  return this.submissions.filter((s) => s.status === "graded").length;
});

// Virtual for average grade
assignmentSchema.virtual("averageGrade").get(function () {
  const gradedSubmissions = this.submissions.filter(
    (s) => s.grade && s.grade.score !== undefined,
  );
  if (gradedSubmissions.length === 0) return 0;

  const total = gradedSubmissions.reduce((sum, s) => sum + s.grade.score, 0);
  return Math.round(total / gradedSubmissions.length);
});

// Virtual for overdue status
assignmentSchema.virtual("isOverdue").get(function () {
  return new Date() > this.dueDate;
});

// Indexes
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isPublished: 1 });

// Pre-save middleware
assignmentSchema.pre("save", function (next) {
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Instance method to add submission
assignmentSchema.methods.addSubmission = function (
  studentId,
  content,
  attachments = [],
) {
  // Remove existing submission from same student
  this.submissions = this.submissions.filter(
    (submission) => !submission.student.equals(studentId),
  );

  // Add new submission
  this.submissions.push({
    student: studentId,
    content,
    attachments,
  });

  return this.save();
};

// Instance method to grade submission
assignmentSchema.methods.gradeSubmission = function (
  submissionId,
  score,
  feedback,
  gradedBy,
) {
  const submission = this.submissions.id(submissionId);
  if (!submission) {
    throw new Error("Submission not found");
  }

  submission.grade = {
    score,
    feedback,
    gradedAt: new Date(),
    gradedBy,
  };
  submission.status = "graded";

  return this.save();
};

// Static method to get assignments for course
assignmentSchema.statics.getByCourse = function (
  courseId,
  includeUnpublished = false,
) {
  const query = { course: courseId };
  if (!includeUnpublished) {
    query.isPublished = true;
  }

  return this.find(query)
    .populate("instructor", "firstName lastName")
    .sort({ dueDate: 1 });
};

// Static method to get assignments for instructor
assignmentSchema.statics.getByInstructor = function (instructorId) {
  return this.find({ instructor: instructorId })
    .populate("course", "title")
    .sort({ createdAt: -1 });
};

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;

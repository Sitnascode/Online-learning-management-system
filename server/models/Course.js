import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["video", "document", "link", "quiz", "assignment"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    materials: [materialSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Course title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      maxlength: [1000, "Course description cannot exceed 1000 characters"],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      enum: [
        "Programming",
        "Data Science",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Health & Fitness",
        "Language",
        "Personal Development",
        "Other",
      ],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    language: {
      type: String,
      default: "English",
    },
    thumbnail: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
    },
    duration: {
      type: Number, // in hours
      default: 0,
    },
    modules: [moduleSchema],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    enrollmentLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          trim: true,
          maxlength: [500, "Review comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    enrollmentSettings: {
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      isOpenEnrollment: {
        type: Boolean,
        default: true,
      },
      requiresApproval: {
        type: Boolean,
        default: false,
      },
    },
    certificateSettings: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      template: {
        type: String,
      },
      passingGrade: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
    },
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
      },
      averageTimeSpent: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for total materials count
courseSchema.virtual("totalMaterials").get(function () {
  if (!this.modules || this.modules.length === 0) return 0;
  return this.modules.reduce(
    (total, module) => total + (module.materials ? module.materials.length : 0),
    0,
  );
});

// Virtual for enrollment availability
courseSchema.virtual("canEnroll").get(function () {
  if (!this.isPublished) return false;
  if (this.enrollmentLimit && this.enrollmentCount >= this.enrollmentLimit)
    return false;

  const now = new Date();
  if (
    this.enrollmentSettings.startDate &&
    now < this.enrollmentSettings.startDate
  )
    return false;
  if (this.enrollmentSettings.endDate && now > this.enrollmentSettings.endDate)
    return false;

  return this.enrollmentSettings.isOpenEnrollment;
});

// Indexes for better query performance
courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ "rating.average": -1 });
courseSchema.index({ enrollmentCount: -1 });
courseSchema.index({ createdAt: -1 });

// Pre-save middleware
courseSchema.pre("save", function (next) {
  // Set publishedAt when course is published
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Calculate total duration from modules
  this.duration =
    this.modules.reduce((total, module) => {
      return (
        total +
        module.materials.reduce((moduleTotal, material) => {
          return moduleTotal + (material.duration || 0);
        }, 0)
      );
    }, 0) / 60; // Convert minutes to hours

  next();
});

// Instance method to add review
courseSchema.methods.addReview = function (userId, rating, comment) {
  // Remove existing review from same user
  this.reviews = this.reviews.filter((review) => !review.user.equals(userId));

  // Add new review
  this.reviews.push({
    user: userId,
    rating,
    comment,
  });

  // Recalculate average rating
  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  );
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;

  return this.save();
};

// Instance method to enroll user
courseSchema.methods.enrollUser = function () {
  this.enrollmentCount += 1;
  return this.save();
};

// Instance method to unenroll user
courseSchema.methods.unenrollUser = function () {
  if (this.enrollmentCount > 0) {
    this.enrollmentCount -= 1;
  }
  return this.save();
};

// Static method to get popular courses
courseSchema.statics.getPopular = function (limit = 10) {
  return this.find({ isPublished: true })
    .sort({ enrollmentCount: -1, "rating.average": -1 })
    .limit(limit)
    .populate("instructor", "firstName lastName avatar");
};

// Static method to search courses
courseSchema.statics.search = function (query, filters = {}) {
  const searchQuery = { isPublished: true };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (filters.category) {
    searchQuery.category = filters.category;
  }

  if (filters.level) {
    searchQuery.level = filters.level;
  }

  if (filters.instructor) {
    searchQuery.instructor = filters.instructor;
  }

  if (filters.priceRange) {
    searchQuery.price = {
      $gte: filters.priceRange.min || 0,
      $lte: filters.priceRange.max || Number.MAX_SAFE_INTEGER,
    };
  }

  return this.find(searchQuery)
    .populate("instructor", "firstName lastName avatar")
    .sort({ score: { $meta: "textScore" }, "rating.average": -1 });
};

const Course = mongoose.model("Course", courseSchema);

export default Course;

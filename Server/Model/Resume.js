const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "My Professional Resume",
    },
    version: {
      type: Number,
      default: 1,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },

    // Personal Details
    personalInfo: {
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      photo: { type: String, default: "" },
      careerObjective: { type: String, default: "" },
    },

    // Education
    education: [
      {
        institution: { type: String, default: "" },
        degree: { type: String, default: "" },
        fieldOfStudy: { type: String, default: "" },
        startYear: { type: String, default: "" },
        endYear: { type: String, default: "" },
        score: { type: String, default: "" },
      },
    ],

    // Skills
    skills: [{ type: String }],

    // Work Experience
    workExperience: [
      {
        company: { type: String, default: "" },
        role: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        currentlyWorking: { type: Boolean, default: false },
        description: { type: String, default: "" },
      },
    ],

    // Internships
    internships: [
      {
        company: { type: String, default: "" },
        role: { type: String, default: "" },
        duration: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],

    // Projects
    projects: [
      {
        title: { type: String, default: "" },
        technologies: { type: String, default: "" },
        link: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],

    // Certifications & Achievements
    certifications: [
      {
        name: { type: String, default: "" },
        issuer: { type: String, default: "" },
        year: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],
    achievements: [{ type: String }],

    // Languages & Social Links & References
    languages: [{ type: String }],
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
    references: [
      {
        name: { type: String, default: "" },
        designation: { type: String, default: "" },
        contact: { type: String, default: "" },
      },
    ],

    // Styling customization
    templateId: {
      type: String,
      default: "modern", // modern, classic_ats, minimal, creative
    },
    themeColor: {
      type: String,
      default: "#2563EB", // Primary accent color
    },
    fontFamily: {
      type: String,
      default: "Inter", // Inter, Roboto, Merriweather, Poppins
    },

    // Payment & Verification
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentId: { type: String, default: "" },
    orderId: { type: String, default: "" },
    invoiceNumber: { type: String, default: "" },
    amountPaid: { type: Number, default: 0 },
    verifiedAt: { type: Date },

    // Download & Version History
    downloadHistory: [
      {
        downloadedAt: { type: Date, default: Date.now },
        ip: { type: String, default: "" },
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Resume", ResumeSchema);

import { useState } from "react";
import { X, Plus, Upload, FileText, Video, Music, Trash2 } from "lucide-react";
import { coursesAPI } from "../services/api";
import toast from "react-hot-toast";

const CourseContentModal = ({ course, onClose, onUpdate }) => {
  const [modules, setModules] = useState(course?.modules || []);
  const [loading, setLoading] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newModule, setNewModule] = useState({ title: "", description: "" });
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    type: "video",
    duration: 0,
    file: null,
  });

  const materialTypes = [
    { value: "video", label: "Video", icon: Video },
    { value: "audio", label: "Audio", icon: Music },
    { value: "document", label: "Document", icon: FileText },
  ];

  const handleAddModule = async () => {
    if (!newModule.title.trim()) {
      toast.error("Module title is required");
      return;
    }

    const moduleData = {
      ...newModule,
      order: modules.length,
      materials: [],
    };

    setModules([...modules, { ...moduleData, _id: Date.now().toString() }]);
    setNewModule({ title: "", description: "" });
    setShowAddModule(false);
    toast.success("Module added successfully");
  };

  const handleDeleteModule = (moduleIndex) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;

    const updatedModules = modules.filter((_, index) => index !== moduleIndex);
    setModules(updatedModules);
    setActiveModule(null);
    toast.success("Module deleted successfully");
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.title.trim()) {
      toast.error("Material title is required");
      return;
    }

    if (!newMaterial.file) {
      toast.error("Please select a file");
      return;
    }

    // Validate file type
    const allowedTypes = {
      video: ["mp4", "avi", "mov", "wmv", "webm"],
      audio: ["mp3", "wav", "ogg", "aac"],
      document: ["pdf", "doc", "docx", "txt", "ppt", "pptx"],
    };

    const fileExtension = newMaterial.file.name.split(".").pop().toLowerCase();
    if (!allowedTypes[newMaterial.type].includes(fileExtension)) {
      toast.error(
        `Invalid file type for ${newMaterial.type}. Allowed: ${allowedTypes[newMaterial.type].join(", ")}`,
      );
      return;
    }

    // Simulate file upload (in real app, you'd upload to cloud storage)
    const materialData = {
      _id: Date.now().toString(),
      title: newMaterial.title,
      description: newMaterial.description,
      type: newMaterial.type,
      duration: parseInt(newMaterial.duration) || 0,
      url: URL.createObjectURL(newMaterial.file), // Mock URL
      filename: newMaterial.file.name,
      size: newMaterial.file.size,
      order: modules[activeModule]?.materials?.length || 0,
    };

    const updatedModules = [...modules];
    if (!updatedModules[activeModule].materials) {
      updatedModules[activeModule].materials = [];
    }
    updatedModules[activeModule].materials.push(materialData);
    setModules(updatedModules);

    setNewMaterial({
      title: "",
      description: "",
      type: "video",
      duration: 0,
      file: null,
    });
    setShowAddMaterial(false);
    toast.success("Material added successfully");
  };

  const handleDeleteMaterial = (moduleIndex, materialIndex) => {
    if (!window.confirm("Are you sure you want to delete this material?"))
      return;

    const updatedModules = [...modules];
    updatedModules[moduleIndex].materials.splice(materialIndex, 1);
    setModules(updatedModules);
    toast.success("Material deleted successfully");
  };

  const handleSaveCourse = async () => {
    setLoading(true);
    try {
      // Ensure modules have proper structure
      const courseData = {
        modules: modules.map((module, index) => ({
          title: module.title || `Module ${index + 1}`,
          description: module.description || "",
          order: index,
          materials: (module.materials || []).map((material, matIndex) => ({
            title: material.title,
            description: material.description || "",
            type: material.type,
            duration: parseInt(material.duration) || 0,
            url: material.url,
            filename: material.filename,
            size: material.size,
            order: matIndex,
          })),
          isPublished: true,
        })),
      };

      await coursesAPI.update(course._id, courseData);
      toast.success("Course content updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Course update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update course content",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage Course Content - {course?.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Modules Sidebar */}
          <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Course Modules</h3>
                <button
                  onClick={() => setShowAddModule(true)}
                  className="btn btn-sm btn-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Module
                </button>
              </div>

              {/* Add Module Form */}
              {showAddModule && (
                <div className="mb-4 p-3 bg-white rounded-lg border">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Module title"
                      value={newModule.title}
                      onChange={(e) =>
                        setNewModule({ ...newModule, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      placeholder="Module description (optional)"
                      value={newModule.description}
                      onChange={(e) =>
                        setNewModule({
                          ...newModule,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddModule}
                        className="btn btn-sm btn-primary"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddModule(false)}
                        className="btn btn-sm btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modules List */}
              <div className="space-y-2">
                {modules.map((module, index) => (
                  <div
                    key={module._id || index}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeModule === index
                        ? "bg-primary-100 border-primary-200"
                        : "bg-white hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveModule(index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {module.title}
                        </h4>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {module.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {module.materials?.length || 0} materials
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(index);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Materials Content */}
          <div className="flex-1 overflow-y-auto">
            {activeModule !== null ? (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {modules[activeModule]?.title}
                    </h3>
                    <p className="text-gray-600">
                      {modules[activeModule]?.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddMaterial(true)}
                    className="btn btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </button>
                </div>

                {/* Add Material Form */}
                {showAddMaterial && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Add New Material
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Material Title *
                        </label>
                        <input
                          type="text"
                          value={newMaterial.title}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter material title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Material Type *
                        </label>
                        <select
                          value={newMaterial.type}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              type: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {materialTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newMaterial.description}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter material description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={newMaterial.duration}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              duration: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload File *
                        </label>
                        <div className="relative">
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  {newMaterial.type === "video" &&
                                    "MP4, AVI, MOV, WMV, WebM"}
                                  {newMaterial.type === "audio" &&
                                    "MP3, WAV, OGG, AAC"}
                                  {newMaterial.type === "document" &&
                                    "PDF, DOC, DOCX, TXT, PPT, PPTX"}
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) =>
                                  setNewMaterial({
                                    ...newMaterial,
                                    file: e.target.files[0],
                                  })
                                }
                                accept={
                                  newMaterial.type === "video"
                                    ? "video/*"
                                    : newMaterial.type === "audio"
                                      ? "audio/*"
                                      : ".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                }
                              />
                            </label>
                          </div>
                          {newMaterial.file && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <svg
                                    className="h-5 w-5 text-green-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-green-800">
                                    File selected: {newMaterial.file.name}
                                  </p>
                                  <p className="text-sm text-green-600">
                                    Size:{" "}
                                    {formatFileSize(newMaterial.file.size)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setShowAddMaterial(false)}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMaterial}
                        className="btn btn-primary"
                      >
                        Add Material
                      </button>
                    </div>
                  </div>
                )}

                {/* Materials List */}
                <div className="space-y-4">
                  {modules[activeModule]?.materials?.map(
                    (material, materialIndex) => {
                      const TypeIcon =
                        materialTypes.find((t) => t.value === material.type)
                          ?.icon || FileText;

                      return (
                        <div
                          key={material._id || materialIndex}
                          className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <TypeIcon className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {material.title}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {material.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span className="capitalize">
                                  {material.type}
                                </span>
                                {material.duration > 0 && (
                                  <span>{material.duration} min</span>
                                )}
                                {material.size && (
                                  <span>{formatFileSize(material.size)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteMaterial(activeModule, materialIndex)
                            }
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    },
                  )}

                  {(!modules[activeModule]?.materials ||
                    modules[activeModule]?.materials?.length === 0) && (
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No materials added yet</p>
                      <p className="text-sm text-gray-400">
                        Click "Add Material" to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Select a module to manage its content
                  </p>
                  <p className="text-sm text-gray-400">
                    Or create a new module to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <button onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button
            onClick={handleSaveCourse}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Saving..." : "Update Course Content"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseContentModal;

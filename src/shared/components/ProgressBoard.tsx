import { useUserProgress } from "@/hooks/useUserProgress";
import { useState } from "react";
import { CheckCircle, Circle, Edit3, Save, X, Calendar, Clock } from "lucide-react";

export default function ProgressBoard() {
  const { weeks, loading, toggle, saveNotes } = useUserProgress();
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState<string>("");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading progress...</span>
      </div>
    );
  }

  // If no weeks data yet, show loading or create message
  if (!weeks) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Setting up your progress tracker...</h3>
          <p className="text-gray-600 mb-6">Initializing your 8-week interview journey</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleEditNotes = (index: number, currentNotes: string) => {
    setEditingNotes(index);
    setTempNotes(currentNotes);
  };

  const handleSaveNotes = (index: number) => {
    saveNotes(index, tempNotes);
    setEditingNotes(null);
    setTempNotes("");
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setTempNotes("");
  };

  return (
    <div className="space-y-4">
      {weeks.map((w, i) => (
        <div 
          key={w.week} 
          className={`group rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
            w.done 
              ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50" 
              : `${w.color || "bg-gray-50 border-gray-200"} hover:shadow-md`
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  w.done 
                    ? "bg-green-500 text-white shadow-lg" 
                    : "bg-white text-gray-600 shadow-sm border-2 border-gray-200 group-hover:border-gray-300"
                }`}>
                  {w.week}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{w.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{w.description || "Complete this week's tasks"}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>Week {w.week}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggle(i, !w.done)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                    w.done
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                  }`}
                >
                  {w.done ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-5 h-5" />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Notes & Outcomes</h4>
                {!editingNotes && (
                  <button
                    onClick={() => handleEditNotes(i, w.notes || "")}
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {editingNotes === i ? (
                <div className="space-y-3">
                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add your notes, outcomes, or reflections..."
                    rows={3}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveNotes(i)}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    w.notes 
                      ? "bg-gray-50 border border-gray-200" 
                      : "bg-gray-50 border-2 border-dashed border-gray-300"
                  }`}
                >
                  {w.notes ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{w.notes}</p>
                  ) : (
                    <p className="text-gray-500 italic">No notes yet. Click the edit icon to add your thoughts.</p>
                  )}
                </div>
              )}
            </div>

            {w.done && (
              <div className="mt-4 flex items-center space-x-2 text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

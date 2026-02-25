import React from 'react';
import { Check, Clock, Cpu, Package } from 'lucide-react';

const DetectionResults = ({ result }) => {
  if (!result) return null;

  // Group detections by class
  const groupedDetections = result.objects_detected.reduce((acc, obj) => {
    const className = obj.class_name;
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(obj);
    return acc;
  }, {});

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Check className="w-5 h-5 text-green-500" />
        Detection Summary
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary-500" />
            <span className="text-dark-400 text-sm">Objects Found</span>
          </div>
          <p className="text-2xl font-bold text-white">{result.total_objects}</p>
        </div>

        <div className="bg-dark-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-green-500" />
            <span className="text-dark-400 text-sm">Processing Time</span>
          </div>
          <p className="text-2xl font-bold text-white">{result.processing_time.toFixed(2)}s</p>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-dark-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent-500" />
          <span className="text-dark-400 text-sm">Model:</span>
          <span className="text-white font-medium">{result.model_used}</span>
        </div>
      </div>

      {/* Detected Objects */}
      {result.total_objects > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3">Detected Objects</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(groupedDetections).map(([className, objects]) => (
              <div key={className} className="bg-dark-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium capitalize">{className}</span>
                  <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                    {objects.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {objects.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1 bg-dark-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-accent-500 h-full transition-all"
                          style={{ width: `${obj.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-dark-400 text-xs w-12 text-right">
                        {(obj.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionResults;

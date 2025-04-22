import React, { useState } from 'react';
import { useFormContext } from './FormContext';

export const Debug: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'state' | 'fields' | 'deps' | 'perf'>('state');
  const { formState, fieldStates, values, schema } = useFormContext();

  // Get dependencies for all fields
  const dependencies = Object.keys(fieldStates).reduce((acc, fieldId) => {
    acc[fieldId] = {
      dependencies: fieldStates[fieldId].dependencies,
      dependents: fieldStates[fieldId].dependents,
    };
    return acc;
  }, {} as Record<string, { dependencies: string[], dependents: string[] }>);

  const renderPerformanceMetrics = () => {
    // This would show render counts, timing info, etc.
    // For now, just a placeholder
    return (
      <div className="smartform-debug-perf">
        <p>Performance data will be displayed here.</p>
      </div>
    );
  };

  const renderStateTab = () => {
    return (
      <div className="smartform-debug-state">
        <h4>Form State</h4>
        <pre>{JSON.stringify(formState, null, 2)}</pre>

        <h4>Current Values</h4>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    );
  };

  const renderFieldsTab = () => {
    return (
      <div className="smartform-debug-fields">
        <h4>Field States</h4>
        <table className="smartform-debug-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
              <th>Touched</th>
              <th>Dirty</th>
              <th>Error</th>
              <th>Visible</th>
              <th>Disabled</th>
              <th>Required</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(fieldStates).map(([fieldId, state]) => (
              <tr key={fieldId}>
                <td>{fieldId}</td>
                <td>{JSON.stringify(state.value)}</td>
                <td>{state.touched ? '✅' : '❌'}</td>
                <td>{state.dirty ? '✅' : '❌'}</td>
                <td>{state.error ? JSON.stringify(state.error) : '-'}</td>
                <td>{state.visible ? '✅' : '❌'}</td>
                <td>{state.disabled ? '✅' : '❌'}</td>
                <td>{state.required ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDependenciesTab = () => {
    return (
      <div className="smartform-debug-deps">
        <h4>Field Dependencies</h4>
        <table className="smartform-debug-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Depends On</th>
              <th>Affects</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(dependencies).map(([fieldId, deps]) => (
              <tr key={fieldId}>
                <td>{fieldId}</td>
                <td>{deps.dependencies.length > 0 ? deps.dependencies.join(', ') : '-'}</td>
                <td>{deps.dependents.length > 0 ? deps.dependents.join(', ') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="smartform-debug">
      <div className="smartform-debug-header">
        <h3>SmartForm Debug</h3>
        <div className="smartform-debug-tabs">
          <button
            className={activeTab === 'state' ? 'active' : ''}
            onClick={() => setActiveTab('state')}
          >
            State
          </button>
          <button
            className={activeTab === 'fields' ? 'active' : ''}
            onClick={() => setActiveTab('fields')}
          >
            Fields
          </button>
          <button
            className={activeTab === 'deps' ? 'active' : ''}
            onClick={() => setActiveTab('deps')}
          >
            Dependencies
          </button>
          <button
            className={activeTab === 'perf' ? 'active' : ''}
            onClick={() => setActiveTab('perf')}
          >
            Performance
          </button>
        </div>
      </div>

      <div className="smartform-debug-content">
        {activeTab === 'state' && renderStateTab()}
        {activeTab === 'fields' && renderFieldsTab()}
        {activeTab === 'deps' && renderDependenciesTab()}
        {activeTab === 'perf' && renderPerformanceMetrics()}
      </div>
    </div>
  );
};

import React from 'react';

function VitalSignsPanel({ vitalSigns }) {
    const { bloodPressure, heartRate, respiratoryRate, temperature, oxygenSaturation, height, weight } = vitalSigns;

    // Helper function to check if a vital sign is empty or null
    const hasValue = (value) => value !== null && value !== undefined && value !== '';

    return (
        <div className="vitalSigns">
            {hasValue(bloodPressure) && (
                <div className="vitalSign">
                    <div className="vitalSignLabel">Blood Pressure</div>
                    <div className="vitalSignValue">{bloodPressure}</div>
                </div>
            )}
            
            {hasValue(heartRate) && (
                <div className="vitalSign">
                    <div className="vitalSignLabel">Heart Rate</div>
                    <div className="vitalSignValue">{heartRate} bpm</div>
                </div>
            )}
            
            {hasValue(respiratoryRate) && (
                <div className="vitalSign">
                    <div className="vitalSignLabel">Respiratory Rate</div>
                    <div className="vitalSignValue">{respiratoryRate} bpm</div>
                </div>
            )}
            
            {hasValue(temperature) && (
                <div className="vitalSign">
                    <div className="vitalSignLabel">Temperature</div>
                    <div className="vitalSignValue">{temperature} °F</div>
                </div>
            )}
            
            {hasValue(oxygenSaturation) && (
                <div className="vitalSign">
                    <div className="vitalSignLabel">Oxygen Saturation</div>
                    <div className="vitalSignValue">{oxygenSaturation} %</div>
                </div>
            )}
            
            {hasValue(height) && (
                <div className="vitalSign">
                    <div className="vitalSignLabel">Height</div>
                    <div className="vitalSignValue">{height} cm</div>
                </div>
            )}
            
            {hasValue(weight) && (
                <div className="vitalSign">
                    <div className="vitalSignLabel">Weight</div>
                    <div className="vitalSignValue">{weight} kg</div>
                </div>
            )}
            
            {/* If no vital signs data is available */}
            {!hasValue(bloodPressure) && !hasValue(heartRate) && !hasValue(respiratoryRate) && 
             !hasValue(temperature) && !hasValue(oxygenSaturation) && !hasValue(height) && 
             !hasValue(weight) && (
                <p>No vital signs data available for this record.</p>
            )}
        </div>
    );
}

export default VitalSignsPanel;
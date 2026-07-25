import React from 'react';
import { Check } from 'lucide-react';

/**
 * Stepper — Multi-step progress indicator
 * Used in OnboardModal and EditModal
 */
const Stepper = ({ steps, current }) => (
  <div className="stepper">
    {steps.map((s, i) => (
      <React.Fragment key={s}>
        <div className="step-item">
          <div className={`step-num ${i + 1 < current ? 'done' : i + 1 === current ? 'active' : ''}`}>
            {i + 1 < current ? <Check style={{ width: 11, height: 11 }} /> : i + 1}
          </div>
          <span className={`step-label ${i + 1 < current ? 'done' : i + 1 === current ? 'active' : ''}`}>{s}</span>
        </div>
        {i < steps.length - 1 && <div className={`step-line ${i + 1 < current ? 'done' : ''}`} />}
      </React.Fragment>
    ))}
  </div>
);

export default Stepper;

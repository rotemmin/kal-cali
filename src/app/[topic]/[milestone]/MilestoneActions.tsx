import React from 'react';
import NavigationButton from '@/components/general/NavigationButton';
import './MilestonePage.css';


interface MilestoneActionsProps {
    mainButtonText: string;
    onMainButtonClick: () => void;
    mainButtonDisabled?: boolean;
    showMainButton?: boolean;
    topic: string;
}

const MilestoneActions: React.FC<MilestoneActionsProps> = ({
    mainButtonText,
    onMainButtonClick,
    mainButtonDisabled = false,
    showMainButton = true,
    topic,
}) => (
    <div className="milestone-actions">
        <NavigationButton
            icon="/icons/dictionary.svg"
            link="/dictionary"
            position="right"
            altText="dictionary"
        />
        {showMainButton && (
            <button 
                className="main-button"
                onClick={onMainButtonClick}
                disabled={mainButtonDisabled}
            >
                {mainButtonText}
            </button>
        )}
        <NavigationButton
            icon="/icons/notebook.svg"
            link={`/personal_notebook${topic ? `?topic=${topic}` : ""}`}
            position="left"
            altText="notebook"
        />
    </div>
);

export default MilestoneActions;

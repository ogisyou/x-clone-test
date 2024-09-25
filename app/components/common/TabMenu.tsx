import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TabMenu = ({ tabs, activeTab }) => {
  const navigate = useNavigate();
  const { uid } = useParams(); // uid を URL から取得

  const handleNavigation = (tab) => {
    navigate(`/${tab}/${uid}/${tab}`); // uid を含めてタブに応じたページに遷移
  };

  return (
    <div className="flex items-center border-b border-gray-700">
      {tabs.map((t) => (
        <div key={t.name} className="relative flex-1">
          <button
            className={`p-3 w-full text-gray-400 hover:bg-gray-800 text-center cursor-pointer text-sm sm:text-base ${
              activeTab === t.name ? 'text-white' : ''
            }`}
            onClick={() => handleNavigation(t.name)}
          >
            {t.label}
          </button>
          {activeTab === t.name && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-500" />
          )}
        </div>
      ))}
    </div>
  );
};

export default TabMenu;

import React from "react";
import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

// プロパティの型を定義
interface SidebarOptionProps {
  text: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  onClick?: () => void; // onClickはオプション
  customClasses?: string; // customClassesはオプション
}

const SidebarOption: React.FC<SidebarOptionProps> = ({
  text,
  Icon,
  onClick,
  customClasses = "",
}) => {
  return (
    <div
      className="flex items-center cursor-pointer ml-5 hover:bg-gray-700 rounded-full p-2"
      onClick={onClick}
    >
      <Icon className="text-5xl p-2" />
      <h2 className={`ml-4 font-bold text-lg ${customClasses}`}>
        {text}
      </h2>
    </div>
  );
};

export default SidebarOption;

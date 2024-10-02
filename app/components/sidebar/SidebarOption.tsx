import React from "react";
import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

// プロパティの型を定義
interface SidebarOptionProps {
  text: string;
  Icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>;
  onClick?: () => void;
  customClasses?: string; 
  iconSize?: string; 
}

const SidebarOption: React.FC<SidebarOptionProps> = ({
  text,
  Icon,
  onClick,
  customClasses = "",
  iconSize = "!text-3xl", 
}) => {
  return (
    <div
      className="flex items-center cursor-pointer ml-5 my-1 sm:my-2 hover:bg-gray-700 rounded-full p-3"
      onClick={onClick}
    >
      <Icon className={`${iconSize}`} /> 
      <h2 className={`ml-4 font-bold text-lg ${customClasses}`}>
        {text}
      </h2>
    </div>
  );
};

export default SidebarOption;

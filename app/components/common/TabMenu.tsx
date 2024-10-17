// app/components/common/TabMenu.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

interface Tab {
  name: string;
  label: string;
}

interface TabMenuProps {
  tabs: Tab[];
}

const TabMenu: React.FC<TabMenuProps> = ({ tabs }) => {
  const params = useParams();
  const pathname = usePathname();
  const uid = params.uid as string;
  const currentTab = pathname.split('/').pop() || '';

  const getTabUrl = (tabName: string) => {
    return `/${tabName}/${uid}/${tabName}`;
  };

  return (
<div className="flex items-center border-b  border-gray-700">
  {tabs.map((t) => (
    <div key={t.name} className="relative flex-grow ">
      <Link
        href={getTabUrl(t.name)}
        className={`block  p-3  text-gray-400 hover:bg-gray-800 text-center cursor-pointer font-bold text-xs sm:text-base ${
          currentTab === t.name ? 'text-white' : ''
        }`}
      >
        {t.label}
      </Link>
      {currentTab === t.name && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-500" />
      )}
    </div>
  ))}
</div>

  );
};

export default TabMenu;
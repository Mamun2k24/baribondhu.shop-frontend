import React from 'react';

export default function IconText({ Icon, title, description }) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <span className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-neutral-950 text-white">
        <Icon className="size-6" strokeWidth={2.4} />
      </span>
      <span className="text-[14px] font-extrabold leading-tight">{title}</span>
      {description && <span className="text-[12px] font-semibold leading-tight">{description}</span>}
    </div>
  );
}
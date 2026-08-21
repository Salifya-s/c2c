import type {ReactNode} from 'react';

import {cn} from '@/src/lib/cn';

type PhoneFrameProps = {
  children: ReactNode;
  className?: string;
};

export const PhoneFrame = ({children, className}: PhoneFrameProps) => {
  return (
    <div
      className={cn(
        'relative flex h-[min(900px,100vh)] w-[430px] max-w-[100vw] flex-col overflow-hidden rounded-[40px] bg-ink-6 shadow-zam-phone max-[440px]:h-screen max-[440px]:rounded-none max-[440px]:shadow-none',
        className
      )}
    >
      {children}
    </div>
  );
};

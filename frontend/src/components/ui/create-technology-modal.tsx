import React from 'react';
import { IoMdClose } from 'react-icons/io';
type ActionsAlign = 'center' | 'end';
interface DialogContent {
  title: React.ReactNode;
  actionButtons: React.ReactNode;
  children: React.ReactNode;
  actionsAlign: ActionsAlign;
  onOpenChange: () => void;
}
const CreateTechnologyModal = ({
  title,
  onOpenChange,
  children,
  actionButtons,
  actionsAlign,
}: DialogContent) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl p-6 w-[680] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-end">
          <IoMdClose className="h-5 cursor-pointer" onClick={onOpenChange} />
        </div>
        <div className="flex flex-col ">
          <label className="font-bold mb-3 text-2xl">{title}</label>
          {children}
        </div>
        <div className=" flex justify-center">
          {actionButtons && (
            <div
              className={`mt-6 flex gap-3 ${
                actionsAlign === 'center' ? 'justify-center' : 'justify-end'
              }`}
            >
              {actionButtons}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTechnologyModal;

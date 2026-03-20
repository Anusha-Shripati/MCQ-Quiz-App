import { IoMdClose } from 'react-icons/io';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { technologyEndpoint } from '@/lib/endpoint';
import { api, isAxiosError } from '@/lib/api';
import { mutate } from 'swr';
interface Data {
  id?: string;
  name: string;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  data?: Data | null;
}
//  SWR mutation fetcher for function create a technology.
async function createTechnology(url: string, { arg }: { arg: { name: string } }) {
  return await api.post(url, arg);
}

async function updateTechnology(url: string, { arg }: { arg: { id: string; name: string } }) {
  return await api.put(url.replace(':id', arg.id), { name: arg.name });
}

const CreateTechnologyModal = ({ open, onClose, data }: DialogProps) => {
  const [value, setValue] = useState('');
  const { trigger: createTrigger, isMutating } = useSWRMutation(
    technologyEndpoint.CREATE_ONLY,
    createTechnology
  );
  const { trigger: updateTrigger, isMutating: isUpdating } = useSWRMutation(
    technologyEndpoint.UPDATE,
    updateTechnology
  );
  useEffect(() => {
    if (open) {
      setValue(data?.name || '');
    }
  }, [open, data]);

  const handleSubmit = async () => {
    if (!value.trim()) {
      toast.error('Please enter technology name');
      return;
    }
    try {
      let res;
      if (data) {
        res = await updateTrigger({ id: data.id!, name: value });
      } else {
        res = await createTrigger({ name: value });
      }
      if (res?.data?.success) {
        toast.success(data ? 'Technology updated successfully' : 'Technology created successfully');
        mutate((key) => typeof key === 'string' && key.startsWith('/technology/list'));
      } else {
        toast.error(res.message);
      }
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };
  const handleClose = () => {
    setValue('');
    onClose();
  };
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-black/40 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-md shadow-2xl p-6 w-[680] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-end">
          <IoMdClose className="h-5 cursor-pointer" onClick={onClose} />
        </div>
        <div className="flex flex-col ">
          <label className="font-bold mb-3 text-2xl">{data ? 'Edit' : 'Add'} Technology</label>
          <input
            type="text"
            className="w-96 px-4 py-5 h-10 border border-gray-300 rounded hover:outline-gray-400 focus:outline-none focus:border-gray-500"
            placeholder="Enter Technology Name..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={onClose} className="px-3 py-2 bg-gray-300 rounded">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isMutating || isUpdating}
            className="px-3 py-2 bg-blue-500 text-white rounded"
          >
            {data ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTechnologyModal;

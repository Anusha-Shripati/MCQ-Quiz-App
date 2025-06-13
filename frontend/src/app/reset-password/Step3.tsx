import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import useSWRMutation from 'swr/mutation';
import { resetPassword } from '@/lib/api';
import { ApiError, NewPasswordProps } from '@/shared/types/app';
import { IoMdArrowRoundBack } from 'react-icons/io';

const NewPassword: React.FC<NewPasswordProps> = ({ onPrevious, email }) => {
    const { trigger, isMutating } = useSWRMutation('/user/reset-password', resetPassword);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
        }
        try {
            const response = await trigger({ email, newPassword: password, confirmPassword });
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Failed to reset password');
            }
            toast.success('Password reset successfully');
            router.push('/dashboard');
        } catch (error) {
            console.error('Error resetting password:', error);
            const apiError = error as ApiError;
            toast.error(
                (typeof apiError === 'object' && apiError !== null && apiError.response?.data?.message) ||
                (error instanceof Error && error.message) ||
                'Failed to reset password'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto text-gray-200">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-900/30 rounded-full mb-4">
                    <LockIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-100">Create New Password</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                    <Label htmlFor="new-password" className="text-base font-medium text-gray-200">New Password</Label>
                    <div className="relative">
                        <Input
                            id="new-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-12 pr-12 bg-gray-800 border-gray-700 text-gray-200 focus:bg-gray-800 focus:border-gray-600 hover:bg-gray-800 focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-200 focus:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="confirm-password" className="text-base font-medium text-gray-200">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="h-12 pr-12 bg-gray-800 border-gray-700 text-gray-200 focus:bg-gray-800 focus:border-gray-600 hover:bg-gray-800 focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-200 focus:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between space-x-4 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onPrevious}
                        className="px-6 h-12 bg-gray-800 hover:bg-gray-700 text-gray-100 focus:bg-gray-800 focus:ring-1 focus:ring-gray-600"
                    >
                        <IoMdArrowRoundBack />
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || isMutating}
                        className="px-6 h-12 bg-gray-800 hover:bg-gray-700 text-gray-100 focus:bg-gray-800 focus:ring-1 focus:ring-gray-600"
                    >
                        {isLoading || isMutating ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NewPassword;

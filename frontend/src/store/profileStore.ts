// import { create } from "zustand";

// interface Profile {
//   name: string;
//   email: string;
// }

// interface ProfileState {
//   profile: Profile;
//   isLoading: boolean;
//   error: string | null;
//   updateProfile: (payload: Profile) => void;
//     fetchProfile: () => Promise<Profile>;
// }
// export const useProfileStore = create<ProfileState>((set) => ({
//   profile: {} as Profile,
//   isLoading: false,
//   error: null,
//   updateProfile: (payload: Profile) => {
//     set({ profile: payload });
//   },
//     fetchProfile: async () => {
//       try {
//         const response = await fetch("https://api.example.com/profile");
//         const data = await response.json();
//         set({ profile: data });
//         return data;
//       } catch (error) {
//         if (error instanceof Error) {
//           set({ error: error.message });
//         } else {
//           set({ error: String(error) });
//         }
//         throw error;
//       }
//     },
// }));

import { create } from "zustand";

interface ProfileState {
  userName: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  reNewPassword: string;
  errors: {
    userNameError: string;
    emailError: string;
    oldPasswordError: string;
    newPasswordError: string;
    reNewPasswordError: string;
  };
  isEditing: boolean;
  isPasswordFormValid: boolean;
  setUserName: (userName: string) => void;
  setEmail: (email: string) => void;
  setOldPassword: (oldPassword: string) => void;
  setNewPassword: (newPassword: string) => void;
  setReNewPassword: (reNewPassword: string) => void;
  setErrors: (errors: Partial<ProfileState["errors"]>) => void;
  setIsEditing: (isEditing: boolean) => void;
  validatePasswordForm: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  userName: "LogicRays",
  email: "hello@iclrays.com",
  oldPassword: "",
  newPassword: "",
  reNewPassword: "",
  errors: {
    userNameError: "",
    emailError: "",
    oldPasswordError: "",
    newPasswordError: "",
    reNewPasswordError: "",
  },
  isEditing: false,
  isPasswordFormValid: true,
  setUserName: (userName) => set({ userName }),
  setEmail: (email) => set({ email }),
  setOldPassword: (oldPassword) => set({ oldPassword }),
  setNewPassword: (newPassword) => set({ newPassword }),
  setReNewPassword: (reNewPassword) => set({ reNewPassword }),
  setErrors: (errors) =>
    set((state) => ({ errors: { ...state.errors, ...errors } })),
  setIsEditing: (isEditing) => set({ isEditing }),
  validatePasswordForm: () => {
    const { oldPassword, newPassword, reNewPassword, setErrors } = get();
    const errors = {
      oldPasswordError: oldPassword.trim() ? "" : "Old Password is required",
      newPasswordError:
        newPassword.length >= 8 ? "" : "Password must be at least 8 characters",
      reNewPasswordError:
        newPassword === reNewPassword ? "" : "Passwords do not match",
    };
    setErrors(errors);
    set({
      isPasswordFormValid:
        !errors.oldPasswordError &&
        !errors.newPasswordError &&
        !errors.reNewPasswordError,
    });
  },
}));

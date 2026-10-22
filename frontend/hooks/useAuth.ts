import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginPayload } from '@/services/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, logout: clearStore } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: (payload: any) => authApi.register(payload),
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('Registration successful!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearStore();
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      // Even if API fails, clear local state
      clearStore();
      queryClient.clear();
      router.push('/login');
    },
  });

  const useGetMe = () => {
    return useQuery({
      queryKey: ['me'],
      queryFn: () => authApi.getMe(),
      enabled: isAuthenticated,
      staleTime: 10 * 60 * 1000,
      retry: false,
    });
  };

  return {
    user,
    isAuthenticated,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    useGetMe,
  };
};

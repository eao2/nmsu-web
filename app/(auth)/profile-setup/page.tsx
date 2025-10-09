// app/(auth)/profile-setup/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FormErrors {
  phone?: string;
  className?: string;
  studentCode?: string;
}

export default function ProfileSetupPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    phone: '',
    className: '',
    studentCode: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.profileComplete) {
        router.replace('/clubs'); 
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && !formData.studentCode) {
      const studentCodeFromEmail = session.user.email.match(/^([^@]+)@/)?.[1] || '';
      
      if (studentCodeFromEmail) {
        setFormData((prevData) => ({
          ...prevData,
          studentCode: studentCodeFromEmail.toUpperCase(),
        }));
      }
    }
  }, [session, status, formData.studentCode]); 

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const phoneRegex = /^\d{8}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Утасны дугаарыг бөглөнө үү.';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Утасны дугаар 8 оронтой тоо байна.';
      isValid = false;
    }

    if (!formData.className.trim()) {
      newErrors.className = 'Ангийн нэрийг бөглөнө үү.';
      isValid = false;
    } else if (formData.className.length > 16) {
      newErrors.className = 'Ангийн нэр 16 тэмдэгтээс хэтрэхгүй байна.';
      isValid = false;
    }

    if (!formData.studentCode.trim()) {
      newErrors.studentCode = 'Оюутны кодыг бөглөнө үү.';
      isValid = false;
    } else if (formData.studentCode.length <= 5 || formData.studentCode.length >= 16) {
      newErrors.studentCode = 'Оюутны код 5-16 тэмдэгтийн хооронд байна.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profileComplete: true,
        }),
      });

      if (response.ok) {
        await update(); 
        router.replace('/clubs');
      } else {
        const errorData = await response.json();
        setErrors({ studentCode: errorData.message || 'Профайл хадгалахад алдаа гарлаа.' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ phone: 'Сүлжээний алдаа гарлаа. Та дахин оролдоно уу.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && session?.user?.profileComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 dark:bg-zinc-900 text-lg dark:text-zinc-100">
        <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 dark:bg-zinc-900">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-foreground dark:text-zinc-100 mb-2 tracking-tight">
          Профайл үүсгэх
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mb-6">
          Дараах мэдээллийг бөглөж дуусгана уу
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
              Утасны дугаар
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: undefined }); 
              }}
              className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                errors.phone ? 'border-red-500 focus-visible:ring-red-500' : 'border-border dark:border-zinc-700'
              }`}
              placeholder="99001122"
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="className" className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
              Анги
            </label>
            <input
              id="className"
              type="text"
              required
              value={formData.className}
              onChange={(e) => {
                setFormData({ ...formData, className: e.target.value.toUpperCase() });
                if (errors.className) setErrors({ ...errors, className: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                errors.className ? 'border-red-500 focus-visible:ring-red-500' : 'border-border dark:border-zinc-700'
              }`}
              placeholder="SE106-1"
            />
            {errors.className && (
              <p className="text-sm text-red-500 mt-1">{errors.className}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="studentCode" className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
              Оюутны код
            </label>
            <input
              id="studentCode"
              type="text"
              required
              value={formData.studentCode}
              onChange={(e) => {
                setFormData({ ...formData, studentCode: e.target.value.toUpperCase() });
                if (errors.studentCode) setErrors({ ...errors, studentCode: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                errors.studentCode ? 'border-red-500 focus-visible:ring-red-500' : 'border-border dark:border-zinc-700'
              }`}
              placeholder="SE25D99"
            />
            {errors.studentCode && (
              <p className="text-sm text-red-500 mt-1">{errors.studentCode}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100"
          >
            {isLoading ? 'Хадгалж байна...' : 'Үргэлжлүүлэх'}
          </button>
        </form>
      </div>
    </div>
  );
}
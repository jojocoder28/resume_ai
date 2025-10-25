'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Mail, Calendar, Edit3, Save, X } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal(''))
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfile() {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    }
  });

  const avatarUrl = watch('avatar');

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          <CardDescription>
            Manage your account information and preferences
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={isEditing ? avatarUrl : user.avatar} 
                alt={user.name}
              />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    {...register('avatar')}
                    className={errors.avatar ? 'border-red-500' : ''}
                  />
                  {errors.avatar && (
                    <p className="text-sm text-red-500">{errors.avatar.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <>
                  <Input
                    id="name"
                    type="text"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{user.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    rows={4}
                    {...register('bio')}
                    className={errors.bio ? 'border-red-500' : ''}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio.message}</p>
                  )}
                </>
              ) : (
                <div className="p-3 bg-muted rounded-md min-h-[100px]">
                  {user.bio ? (
                    <p className="whitespace-pre-wrap">{user.bio}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No bio added yet.</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersTable } from './_components/users-table';
import { TemplatesTable } from './_components/templates-table';
import { RequestsTable } from './_components/requests-table';
import { Shield } from 'lucide-react';
import User from '@/models/User';
import Template from '@/models/Template';
import Request from '@/models/Request';
import connectDB from '@/lib/mongodb';

export const maxDuration = 120;

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/');
  }

  await connectDB();
  const users = await User.find({}).sort({ createdAt: -1 });
  const templates = await Template.find({}).sort({ createdAt: -1 });
  const requests = await Request.find({}).sort({ createdAt: -1 }).populate('user', 'name email');

  const plainUsers = JSON.parse(JSON.stringify(users));
  const plainTemplates = JSON.parse(JSON.stringify(templates));
  const plainRequests = JSON.parse(JSON.stringify(requests));
  
  return (
    <div className="container mx-auto px-4 py-12">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                    <Shield className="h-6 w-6" /> Admin Dashboard
                </CardTitle>
                <CardDescription>
                    Manage users, resume templates, and processed requests.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="users">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="requests">Requests</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users">
                       <UsersTable initialData={plainUsers} />
                    </TabsContent>
                    <TabsContent value="templates">
                       <TemplatesTable initialData={plainTemplates} />
                    </TabsContent>
                    <TabsContent value="requests">
                        <RequestsTable initialData={plainRequests} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}
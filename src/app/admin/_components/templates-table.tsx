'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2, ArrowUpDown, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

const templateFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  image: z.custom<FileList>().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
  latexCode: z.string().min(20, 'LaTeX code is required'),
  isDefault: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;
type Template = TemplateFormData & { _id?: string, createdAt?: string };

async function createOrUpdateTemplate(template: Omit<Template, 'image'>) {
  const method = template._id ? 'PUT' : 'POST';
  const response = await fetch('/api/admin/templates', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save template');
  }
  return response.json();
}

async function deleteTemplate(id: string) {
  const response = await fetch('/api/admin/templates', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete template');
  }
  return response.json();
}

export function TemplatesTable({ initialData }: { initialData: Template[] }) {
  const [data, setData] = React.useState<Template[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { toast } = useToast();

  const columns: ColumnDef<Template>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Name <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                {row.original.imageUrl && <Image src={row.original.imageUrl} alt={row.original.name} width={40} height={40} className="rounded-sm" />}
                <span>{row.original.name}</span>
            </div>
        )
      },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <div className="truncate max-w-xs">{row.original.description}</div>,
    },
    {
      accessorKey: 'isDefault',
      header: 'Default',
      cell: ({ row }) => (row.original.isDefault ? 'Yes' : 'No'),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Created At <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
      cell: ({ row }) => new Date(row.original.createdAt as any).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex gap-2">
            <TemplateForm template={template} onSave={handleSave} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete the template.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(template._id!)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  const handleSave = (savedTemplate: Template) => {
    setData((currentData) => {
      const isNew = !currentData.find(t => t._id === savedTemplate._id);
      if (isNew) {
        return [savedTemplate, ...currentData];
      } else {
        return currentData.map((t) => (t._id === savedTemplate._id ? savedTemplate : t));
      }
    });
    toast({ title: 'Success', description: 'Template saved successfully.' });
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      setData(data.filter(t => t._id !== id));
      toast({ title: 'Success', description: 'Template deleted.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Manage Templates</h3>
        <TemplateForm onSave={handleSave} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function TemplateForm({ template, onSave }: { template?: Template; onSave: (template: Template) => void }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [imagePreview, setImagePreview] = React.useState<string | null>(template?.imageUrl || null);
    const { toast } = useToast();

    const form = useForm<TemplateFormData>({
        resolver: zodResolver(templateFormSchema),
        defaultValues: template || { name: '', description: '', imageUrl: '', imageHint: '', latexCode: '', isDefault: false },
    });
    const imageWatch = form.watch('image');

    React.useEffect(() => {
        if (imageWatch && imageWatch.length > 0) {
            const file = imageWatch[0];
            setImagePreview(URL.createObjectURL(file));
        } else if (template?.imageUrl) {
            setImagePreview(template.imageUrl);
        } else {
            setImagePreview(null);
        }
    }, [imageWatch, template?.imageUrl]);
    
    const onSubmit = async (values: TemplateFormData) => {
        try {
            let imageUrl = template?.imageUrl || '';
            
            if (values.image && values.image.length > 0) {
                const formData = new FormData();
                formData.append('file', values.image[0]);

                const uploadResponse = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Image upload failed');
                }
                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.url;
            }

            if (!imageUrl && !template) {
                throw new Error('Image is required for new templates.');
            }
            
            const templateToSave = {
                ...template,
                ...values,
                imageUrl,
            };
            delete templateToSave.image;
            
            const saved = await createOrUpdateTemplate(templateToSave);
            onSave(saved.template);
            setIsOpen(false);
            form.reset();
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };
    
    React.useEffect(() => {
        if(isOpen) {
            form.reset(template || { name: '', description: '', imageUrl: '', imageHint: '', latexCode: '', isDefault: false });
            setImagePreview(template?.imageUrl || null);
        }
    }, [isOpen, template, form]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {template ? (
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                ) : (
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Template</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template ? 'Edit' : 'Add'} Template</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Template Image</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <label htmlFor="image-upload" className="cursor-pointer border-2 border-dashed rounded-md p-4 hover:bg-muted text-center w-full">
                                            <div className="flex flex-col items-center justify-center">
                                                <Upload className="h-8 w-8 text-muted-foreground" />
                                                <span className="mt-2 text-sm">Click to upload image</span>
                                            </div>
                                            <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={e => onChange(e.target.files)} {...rest} />
                                        </label>
                                        {imagePreview && (
                                            <div className="w-24 h-32 relative flex-shrink-0">
                                                <Image src={imagePreview} alt="preview" layout="fill" objectFit="contain" className="rounded-md" />
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="imageHint" render={({ field }) => (
                            <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input {...field} placeholder="e.g. 'classic resume'" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="latexCode" render={({ field }) => (
                            <FormItem><FormLabel>LaTeX Code</FormLabel><FormControl><Textarea rows={10} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="isDefault" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div>
                                    <FormLabel>Default Template</FormLabel>
                                    <FormMessage />
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Save Template'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

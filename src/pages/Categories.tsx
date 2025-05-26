import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    Category, 
    NewCategory 
} from '../services/categoryService'; // Path needs to be @/services
import { getToken } from '../services/loginService'; // Path needs to be @/services
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Path needs to be @/components
import { PlusCircle, Edit2, Trash2, ImageOff } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState<NewCategory>({
    name: '',
    image: '',
    type: 'small',
  });

  const { toast } = useToast();

  const fetchAndSetCategories = useCallback(async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err: any) {
      setErrorCategories(err.message || 'Failed to fetch categories.');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetCategories();
  }, [fetchAndSetCategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: 'featured' | 'small' | 'horizontal') => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', image: '', type: 'small' });
    setEditingCategory(null);
  };

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        image: category.image,
        type: category.type,
      });
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Not authenticated. Please log in.", variant: "destructive" });
      return;
    }
    if (!formData.name.trim() || !formData.image.trim()) {
      toast({ title: "Validation Error", description: "Name and Image URL are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData, token);
        toast({ title: "Success!", description: "Category updated successfully." });
      } else {
        await createCategory(formData, token);
        toast({ title: "Success!", description: "Category created successfully." });
      }
      setShowForm(false);
      resetForm();
      await fetchAndSetCategories();
    } catch (err: any) {
      toast({ 
        title: editingCategory ? "Update Failed" : "Creation Failed", 
        description: err.message || (editingCategory ? "Could not update category." : "Could not create category."), 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Not authenticated. Please log in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true); // Use isSubmitting to disable buttons during delete
    try {
      await deleteCategory(id, token);
      toast({ title: "Success!", description: "Category deleted successfully." });
      await fetchAndSetCategories();
    } catch (err: any) {
      toast({ title: "Deletion Failed", description: err.message || "Could not delete category.", variant: "destructive" });
      } finally {
      setIsSubmitting(false);
    }
  };
  
  const formTitle = editingCategory ? "Edit Category" : "Add New Category";
  const submitButtonText = editingCategory ? "Update Category" : "Create Category";

  if (loadingCategories && categories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="large" message="Loading Categories..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Categories</h1>
          <Button onClick={() => handleOpenForm()} disabled={isSubmitting}>
            <PlusCircle className="mr-2 h-5 w-5" /> {showForm && editingCategory === null ? "Cancel" : "Add Category"}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">{formTitle}</h2>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Enter category name" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" name="image" type="url" value={formData.image} onChange={handleInputChange} placeholder="Enter image URL" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={handleTypeChange} name="type">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner size="small" /> : submitButtonText}
                </Button>
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }} disabled={isSubmitting}>
                    Cancel
            </Button>
      </div>
          </form>
        )}
        
        {errorCategories && !loadingCategories && (
            <div className="p-4 mb-4 bg-destructive/10 text-destructive border border-destructive rounded-md text-center">
                <p className="font-semibold">An Error Occurred</p>
                <p className="text-sm">{errorCategories}</p>
                <Button onClick={fetchAndSetCategories} variant="secondary" size="sm" className="mt-3">Retry</Button>
        </div>
      )}

        {!loadingCategories && categories.length === 0 && !errorCategories && (
         <div className="text-center py-12 bg-muted/50 rounded-lg">
                <h2 className="text-2xl font-semibold text-foreground mb-3">No Categories Found</h2>
            <p className="text-muted-foreground mb-6">Get started by adding your first category.</p>
                <Button onClick={() => handleOpenForm()} disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add First Category
            </Button>
        </div>
      )}
      
      {categories.length > 0 && (
          <div className="overflow-x-auto relative">
            {isSubmitting && loadingCategories && ( // Show overlay loader when submitting and also loading categories (e.g., after a submit action)
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-10">
                    <LoadingSpinner size="medium" message="Processing..." />
                </div>
            )}
            <table className={`min-w-full divide-y divide-gray-200 ${isSubmitting && loadingCategories ? 'opacity-50' : ''}`}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14">
                        {category.image ? (
                          <img className="h-full w-full rounded-md object-cover" src={category.image} alt={category.name} />
                        ) : (
                          <div className="h-full w-full rounded-md bg-muted flex items-center justify-center">
                            <ImageOff className="h-6 w-6 text-muted-foreground/70" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${category.type === 'featured' ? 'bg-green-100 text-green-800' : category.type === 'horizontal' ? 'bg-blue-100 text-blue-800': 'bg-yellow-100 text-yellow-800' }`}>
                        {category.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenForm(category)} disabled={isSubmitting} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" disabled={isSubmitting} className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the category "{category.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
import { useEffect, useState, FormEvent } from "react";
import {
  getPromotions,
  addPromotion,
  updatePromotion,
  deletePromotion,
  getSummerCollection,
  updateSummerCollection,
  Promotion,
  CreatePromotionData,
  UpdatePromotionData,
  SummerCollectionData,
  UpdateSummerCollectionPayload,
} from "@/services/promotionService";
import { getCategories, Category } from "@/services/categoryService"; // Import category service and type
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"; // For displaying notifications
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
import { Edit2, Trash2, Info, Save } from 'lucide-react'; // Icons for buttons
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Import Card components

const Promotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState<boolean>(true);
  const [errorPromotions, setErrorPromotions] = useState<string | null>(null);

  const [summerCollection, setSummerCollection] = useState<SummerCollectionData | null>(null);
  const [loadingSummerCollection, setLoadingSummerCollection] = useState<boolean>(true);
  const [errorSummerCollection, setErrorSummerCollection] = useState<string | null>(null);
  const [showEditSummerCollectionForm, setShowEditSummerCollectionForm] = useState<boolean>(false);
  const [summerCollectionFormData, setSummerCollectionFormData] = useState<UpdateSummerCollectionPayload>({});
  const [updatingSummerCollection, setUpdatingSummerCollection] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newPromotion, setNewPromotion] = useState<CreatePromotionData>({
    title: "",
    description: "",
    buttonText: "",
    image: "",
    categoryId: "",
  });
  const [addingPromotion, setAddingPromotion] = useState<boolean>(false);

  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [updatedPromotionData, setUpdatedPromotionData] = useState<UpdatePromotionData>({});
  const [updatingPromotion, setUpdatingPromotion] = useState<boolean>(false);

  const { toast } = useToast();

  const fetchSummerCollectionData = async () => {
    try {
      setLoadingSummerCollection(true);
      const summerData = await getSummerCollection();
      setSummerCollection(summerData);
    } catch (err: any) {
      setErrorSummerCollection(err.message);
    } finally {
      setLoadingSummerCollection(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingPromotions(true);
        const promoData = await getPromotions();
        setPromotions(promoData);
      } catch (err: any) {
        setErrorPromotions(err.message);
      } finally {
        setLoadingPromotions(false);
      }

      try {
        setLoadingCategories(true);
        const catData = await getCategories();
        setCategories(catData);
      } catch (err: any) {
        setErrorCategories(err.message);
      } finally {
        setLoadingCategories(false);
      }
      fetchSummerCollectionData(); // Fetch summer collection
    };
    fetchInitialData();
  }, []);

  const handleSummerCollectionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSummerCollectionFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummerCollectionCategoryChange = (value: string) => {
    setSummerCollectionFormData((prev) => ({ ...prev, categoryId: value }));
  };
  
  const handleEditSummerCollection = () => {
    if (summerCollection) {
      setSummerCollectionFormData({
        title: summerCollection.title,
        description: summerCollection.description,
        additionalText: summerCollection.additionalText,
        buttonText: summerCollection.buttonText,
        image: summerCollection.image,
        categoryId: summerCollection.categoryId,
        badgeYear: summerCollection.badgeYear,
        badgeText: summerCollection.badgeText,
      });
      setShowEditSummerCollectionForm(true);
    }
  };

  const handleUpdateSummerCollectionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!summerCollection) return;

    setUpdatingSummerCollection(true);
    try {
      const updatedData = await updateSummerCollection(summerCollection.id, summerCollectionFormData);
      setSummerCollection(updatedData);
      setShowEditSummerCollectionForm(false);
      toast({ title: "Success!", description: "Summer Collection updated successfully." });
    } catch (err: any) {
      toast({ title: "Error updating Summer Collection", description: err.message || "Could not update.", variant: "destructive" });
    } finally {
      setUpdatingSummerCollection(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (showEditForm && editingPromotion) {
      setUpdatedPromotionData((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewPromotion((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (value: string) => {
    if (showEditForm && editingPromotion) {
      setUpdatedPromotionData((prev) => ({ ...prev, categoryId: value }));
    } else {
      setNewPromotion((prev) => ({ ...prev, categoryId: value }));
    }
  };

  const resetAddForm = () => {
    setNewPromotion({ title: "", description: "", buttonText: "", image: "", categoryId: "" });
  };

  const handleAddPromotionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPromotion.categoryId) {
      toast({ title: "Error", description: "Please select a category.", variant: "destructive" });
      return;
    }
    setAddingPromotion(true);
    try {
      const added = await addPromotion(newPromotion);
      setPromotions((prev) => [added, ...prev]);
      setShowAddForm(false);
      resetAddForm();
      toast({ title: "Success!", description: "Promotion added successfully." });
    } catch (err: any) {
      toast({ title: "Error adding promotion", description: err.message || "Could not add promotion.", variant: "destructive" });
    } finally {
      setAddingPromotion(false);
    }
  };

  const handleEditClick = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setUpdatedPromotionData({
      title: promotion.title,
      description: promotion.description,
      buttonText: promotion.buttonText,
      image: promotion.image,
      categoryId: promotion.categoryId,
    });
    setShowEditForm(true);
    setShowAddForm(false); // Close add form if open
  };

  const handleUpdatePromotionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPromotion) return;
    if (!updatedPromotionData.categoryId) {
        toast({ title: "Error", description: "Please select a category.", variant: "destructive" });
        return;
    }
    setUpdatingPromotion(true);
    try {
      const updated = await updatePromotion(editingPromotion.id, updatedPromotionData);
      setPromotions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setShowEditForm(false);
      setEditingPromotion(null);
      toast({ title: "Success!", description: "Promotion updated successfully." });
    } catch (err: any) {
      toast({ title: "Error updating promotion", description: err.message || "Could not update promotion.", variant: "destructive" });
    } finally {
      setUpdatingPromotion(false);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      await deletePromotion(promotionId);
      setPromotions((prev) => prev.filter((p) => p.id !== promotionId));
      toast({ title: "Success!", description: "Promotion deleted successfully." });
    } catch (err: any) {
      toast({ title: "Error deleting promotion", description: err.message || "Could not delete promotion.", variant: "destructive" });
    }
  };
  
  const currentFormData = showEditForm ? updatedPromotionData : newPromotion;
  const currentFormSubmitHandler = showEditForm ? handleUpdatePromotionSubmit : handleAddPromotionSubmit;
  const currentFormTitle = showEditForm ? "Edit Promotion" : "Add New Promotion";
  const currentSubmitButtonText = showEditForm ? "Update Promotion" : "Submit Promotion";
  const isLoadingCurrentForm = showEditForm ? updatingPromotion : addingPromotion;

  if (loadingPromotions || loadingCategories || loadingSummerCollection) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="large" message="Loading data..." /></div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      {/* Summer Collection Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Summer Collection</CardTitle>
          {summerCollection && !showEditSummerCollectionForm && (
             <Button variant="outline" size="sm" onClick={handleEditSummerCollection}><Edit2 className="mr-2 h-4 w-4" /> Edit Collection</Button>
          )}
        </CardHeader>
        <CardContent>
          {errorSummerCollection && (
            <div className="text-destructive">
              <Info className="mr-2 h-5 w-5 inline" /> Error: {errorSummerCollection}
              <Button variant="secondary" size="sm" className="ml-2" onClick={fetchSummerCollectionData}>Retry</Button>
            </div>
          )}
          {loadingSummerCollection && !summerCollection && <LoadingSpinner message="Loading Summer Collection..."/>}
          
          {showEditSummerCollectionForm && summerCollection && (
            <form onSubmit={handleUpdateSummerCollectionSubmit} className="p-4 border rounded-lg space-y-4 my-4">
              <h3 className="text-lg font-semibold">Edit Summer Collection</h3>
              <div>
                <Label htmlFor="sc_title">Title</Label>
                <Input id="sc_title" name="title" value={summerCollectionFormData.title || ''} onChange={handleSummerCollectionInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="sc_description">Description</Label>
                <Input id="sc_description" name="description" value={summerCollectionFormData.description || ''} onChange={handleSummerCollectionInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="sc_additionalText">Additional Text</Label>
                <Input id="sc_additionalText" name="additionalText" value={summerCollectionFormData.additionalText || ''} onChange={handleSummerCollectionInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="sc_buttonText">Button Text</Label>
                <Input id="sc_buttonText" name="buttonText" value={summerCollectionFormData.buttonText || ''} onChange={handleSummerCollectionInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="sc_image">Image URL</Label>
                <Input id="sc_image" name="image" type="url" value={summerCollectionFormData.image || ''} onChange={handleSummerCollectionInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="sc_badgeText">Badge Text</Label>
                <Input id="sc_badgeText" name="badgeText" value={summerCollectionFormData.badgeText || ''} onChange={handleSummerCollectionInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="sc_badgeYear">Badge Year</Label>
                <Input id="sc_badgeYear" name="badgeYear" value={summerCollectionFormData.badgeYear || ''} onChange={handleSummerCollectionInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="sc_categoryId">Category</Label>
                <Select onValueChange={handleSummerCollectionCategoryChange} value={summerCollectionFormData.categoryId || ''} name="categoryId">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={updatingSummerCollection || loadingCategories}>
                  {updatingSummerCollection ? <LoadingSpinner size="small" /> : <><Save className="mr-2 h-4 w-4"/> Update Collection</>}
                </Button>
                <Button variant="outline" type="button" onClick={() => setShowEditSummerCollectionForm(false)} disabled={updatingSummerCollection}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {!showEditSummerCollectionForm && summerCollection && !errorSummerCollection && (
            <div className="mt-4">
                {summerCollection.badgeText && summerCollection.badgeYear && (
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold inline-block mb-2">
                        {summerCollection.badgeText} {summerCollection.badgeYear}
                    </div>
                )}
                <img src={summerCollection.image} alt={summerCollection.title} className="w-full h-64 object-cover rounded-md mb-4" />
                <h2 className="text-2xl font-bold mb-2">{summerCollection.title}</h2>
                <p className="text-gray-600 mb-1">{summerCollection.description}</p>
                {summerCollection.additionalText && <p className="text-sm text-gray-500 mb-3">{summerCollection.additionalText}</p>}
                {summerCollection.category && <p className="text-sm text-gray-500 mb-4">Category: <span className="font-semibold">{summerCollection.category.name}</span></p>}
                <Button size="lg" className="w-full md:w-auto">{summerCollection.buttonText || "Explore"}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Promotions Table and Form */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Manage Promotions</h1>
          <Button onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); setEditingPromotion(null); resetAddForm(); }}>
            {showAddForm ? "Cancel" : "Add Promotion"}
          </Button>
        </div>

        {(showAddForm || showEditForm) && (
          <form onSubmit={currentFormSubmitHandler} className="mb-6 p-4 border rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">{currentFormTitle}</h2>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input type="text" name="title" id="title" value={currentFormData.title || ''} onChange={handleInputChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input type="text" name="description" id="description" value={currentFormData.description || ''} onChange={handleInputChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input type="text" name="buttonText" id="buttonText" value={currentFormData.buttonText || ''} onChange={handleInputChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input type="url" name="image" id="image" value={currentFormData.image || ''} onChange={handleInputChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              {errorCategories ? (
                <p className="text-red-500 text-sm">Error: {errorCategories}</p>
              ) : categories.length === 0 && !loadingCategories ? (
                <p className="text-gray-500 text-sm">No categories. Add categories first.</p>
              ) : (
                <Select onValueChange={handleCategoryChange} value={currentFormData.categoryId || ''} name="categoryId">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex space-x-2">
                <Button type="submit" disabled={isLoadingCurrentForm || loadingCategories || (categories.length === 0 && !errorCategories)}>
                {isLoadingCurrentForm ? <LoadingSpinner size="small" /> : currentSubmitButtonText}
                </Button>
                {(showEditForm) && (
                    <Button variant="outline" type="button" onClick={() => {setShowEditForm(false); setEditingPromotion(null);}}>
                        Cancel Edit
                    </Button>
                )}
            </div>
          </form>
        )}

        {errorPromotions && (
             <p className="p-4 text-red-500 text-center">Error loading promotions: {errorPromotions}</p>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Button Text</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{promotion.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{promotion.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{promotion.buttonText}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <img src={promotion.image} alt={promotion.title} className="h-10 w-10 object-cover rounded" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{promotion.category?.name || promotion.categoryId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(promotion)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the promotion titled "{promotion.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePromotion(promotion.id)} className="bg-red-600 hover:bg-red-700">
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
        {promotions.length === 0 && !loadingPromotions && !errorPromotions && (
          <p className="text-center text-gray-500 py-4">No promotions found.</p>
        )}
      </div>
    </div>
  );
};

export default Promotions;

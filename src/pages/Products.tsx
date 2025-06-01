import React, { useState, useEffect, FormEvent } from "react";
import {
  Search, Filter, ChevronDown, PlusCircle, Eye, Edit, Trash2, ExternalLink,
  PackageCheck, Flame, Tag, Clock, Truck, ShieldCheck, Sparkles, Info, Plus, X,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
  ProductsApiResponse,
  ProductImage,
  CreateProductData,
  UpdateProductData,
  CreateProductImageDto,
  ProductBenefit,
  ProductInformation,
  getProductReviews,
  Review
} from "@/services/productService";
import { getCategories, Category } from "@/services/categoryService";
import { getColors, Color as ServiceColor } from "@/services/colorAndSizeService"; // Renamed to avoid conflict
import { getSizes, Size as ServiceSize } from "@/services/colorAndSizeService";   // Renamed to avoid conflict

// Format currency - assuming INR based on API response
const formatCurrency = (value: number, currencyCode: string = "INR") => {
  return new Intl.NumberFormat("en-IN", { // Adjusted for India
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0, // Typically whole numbers for INR in display
    maximumFractionDigits: 2,
  }).format(value);
};

const initialProductFormData: CreateProductData = {
  name: "",
  price: 0,
  originalPrice: undefined,
  discount: undefined,
  saleEndsIn: undefined,
  currency: "INR",
  categoryId: "",
  fabric: "",
  isBest: false,
  isNew: false,
  description: "",
  images: [{ imageUrl: "", isPrimary: true }],
  colors: [],
  sizes: [],
  productBenefits: [{ icon: "", text: "" }],
  productInformation: { work: "", style: "", length: "", material: "", occasion: "", set_contents: "" },
  shippingPoints: [""],
  careInstructions: [""],
};

const Products = () => {
  const [productsData, setProductsData] = useState<ProductsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [productFormData, setProductFormData] = useState<CreateProductData>(initialProductFormData);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState<boolean>(false);
  
  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateProductData>({}); // Initialize with empty object or adapt initialProductFormData

  // State for Delete Confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // State for Reviews Modal
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const [reviewsForProduct, setReviewsForProduct] = useState<Review[] | null>(null);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<Product | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [allColors, setAllColors] = useState<ServiceColor[]>([]);
  const [allSizes, setAllSizes] = useState<ServiceSize[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all"); // category ID or 'all'

  const { toast } = useToast();

  const fetchProductData = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const data = await getProducts(page, limit);
      setProductsData(data);
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error fetching products", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialFormData = async () => {
    try {
      const [catData, colorData, sizeData] = await Promise.all([
        getCategories(),
        getColors(),
        getSizes(),
      ]);
      setCategories(catData);
      setAllColors(colorData);
      setAllSizes(sizeData);
    } catch (err: any) {
      toast({ title: "Error fetching form data", description: "Could not load categories, colors, or sizes.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchInitialFormData();
  }, []);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    // Pre-fill edit form data - ensure all fields from Product that are in UpdateProductData are mapped
    // This needs to be comprehensive based on your UpdateProductData structure
    setEditFormData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      saleEndsIn: product.saleEndsIn,
      currency: product.currency,
      categoryId: product.categoryId,
      fabric: product.fabric,
      isBest: product.isBest,
      isNew: product.isNew,
      description: product.description,
      images: product.images.map(img => ({ imageUrl: img.imageUrl, isPrimary: img.isPrimary })), // Convert ProductImage to CreateProductImageDto
      colors: product.colors.map(c => c.id),
      sizes: product.sizes.map(s => s.id),
      productBenefits: product.productBenefits, // Assuming structure matches
      productInformation: product.productInformation, // Assuming structure matches
      shippingPoints: product.shippingPoints,
      careInstructions: product.careInstructions,
      rating: product.rating, // Add rating if it's part of UpdateProductData
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
  };

  const handleViewReviews = async (product: Product) => {
    setSelectedProductForReviews(product);
    setIsReviewsModalOpen(true);
    setLoadingReviews(true);
    setReviewsForProduct(null); // Clear previous reviews
    try {
      const fetchedReviews = await getProductReviews(product.id);
      setReviewsForProduct(fetchedReviews);
    } catch (err: any) {
      toast({ title: `Error fetching reviews for ${product.name}`, description: err.message, variant: "destructive" });
      setReviewsForProduct([]); // Set to empty array on error to stop loading
    } finally {
      setLoadingReviews(false);
    }
  };

  const getPrimaryImage = (images: ProductImage[] | CreateProductImageDto[]): string | undefined => {
    const primary = images.find(img => img.isPrimary);
    return primary ? primary.imageUrl : images[0]?.imageUrl;
  };

  // Form input change handlers
  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; 
    setProductFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value),
    }));
  };

  const handleCategoryChange = (value: string) => {
    setProductFormData(prev => ({ ...prev, categoryId: value }));
  };
  
  // Dynamic array field handlers (simplified for now)
  const handleImageChange = (index: number, field: keyof CreateProductImageDto, value: string | boolean) => {
    const updatedImages = [...productFormData.images];
    if(field === 'isPrimary' && typeof value === 'boolean'){
        updatedImages.forEach((img, i) => img.isPrimary = i === index ? value : false);
    } else if (field === 'imageUrl' && typeof value === 'string') {
        updatedImages[index][field] = value;
    }
    setProductFormData(prev => ({ ...prev, images: updatedImages }));
  };

  const addImageField = () => {
    setProductFormData(prev => ({ ...prev, images: [...prev.images, { imageUrl: "", isPrimary: false }] }));
  };

  const removeImageField = (index: number) => {
    // Ensure at least one image and if it's primary, make another primary before removing
    if (productFormData.images.length > 1) {
      const updatedImages = productFormData.images.filter((_, i) => i !== index);
      if (!updatedImages.find(img => img.isPrimary) && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }
      setProductFormData(prev => ({ ...prev, images: updatedImages }));
    }
  };

  // TODO: Handlers for colors, sizes, benefits, info, shipping, care (multi-select and dynamic text fields)
   const handleMultiSelectChange = (field: 'colors' | 'sizes', selectedIds: string[]) => {
    setProductFormData(prev => ({ ...prev, [field]: selectedIds }));
  };

  const handleDynamicListChange = (
    field: 'productBenefits' | 'shippingPoints' | 'careInstructions',
    index: number,
    value: string | ProductBenefit,
    subField?: keyof ProductBenefit
  ) => {
    const list = [...productFormData[field] as any[]];
    if (field === 'productBenefits' && typeof value === 'object' && subField) {
      list[index][subField] = (value as any)[subField];
    } else if (typeof value === 'string'){
      list[index] = value;
    }
    setProductFormData(prev => ({ ...prev, [field]: list }));
  };

  const addDynamicListItem = (field: 'productBenefits' | 'shippingPoints' | 'careInstructions') => {
    let newItem: string | ProductBenefit = "";
    if(field === 'productBenefits') newItem = {icon: "", text: ""};
    setProductFormData(prev => ({ ...prev, [field]: [...prev[field] as any[], newItem] }));
  };

 const removeDynamicListItem = (field: 'productBenefits' | 'shippingPoints' | 'careInstructions', index: number) => {
    if ((productFormData[field] as any[]).length > 1) {
        setProductFormData(prev => ({ ...prev, [field]: (prev[field] as any[]).filter((_, i) => i !== index) }));
    }
  };
  
  const handleProductInformationChange = (key: keyof ProductInformation, value: string) => {
    setProductFormData(prev => ({
        ...prev,
        productInformation: {
            ...prev.productInformation,
            [key]: value
        }
    }));
  };


  const handleAddProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingProduct(true);
    try {
      // Basic validation (can be expanded with a library like Zod)
      if (!productFormData.name || !productFormData.price || !productFormData.categoryId || !productFormData.images[0]?.imageUrl) {
        toast({ title: "Validation Error", description: "Name, Price, Category, and at least one Image URL are required.", variant: "destructive" });
        setIsSubmittingProduct(false);
        return;
      }
      const newProduct = await addProduct(productFormData);
      setProductsData(prev => prev ? { ...prev, products: [newProduct, ...prev.products], totalItems: prev.totalItems + 1 } : null);
      toast({ title: "Success!", description: `Product "${newProduct.name}" added successfully.` });
      setIsAddModalOpen(false);
      setProductFormData(initialProductFormData); // Reset form
    } catch (err: any) {
      toast({ title: "Error adding product", description: err.message || "Could not add product.", variant: "destructive" });
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Handler for Edit Form Input Change (can be similar to handleFormInputChange or more specific for UpdateProductData)
  const handleEditFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || undefined : value), // Allow undefined for optional numbers
    }));
  };
  
  const handleEditCategoryChange = (value: string) => {
    setEditFormData(prev => ({ ...prev, categoryId: value }));
  };

  const handleEditImageChange = (index: number, field: keyof CreateProductImageDto, value: string | boolean) => {
    const updatedImages = [...(editFormData.images || [])];
     if (field === 'isPrimary' && typeof value === 'boolean') {
        updatedImages.forEach((img, i) => img.isPrimary = (i === index ? value : false));
    } else if (field === 'imageUrl' && typeof value === 'string') {
        if (!updatedImages[index]) updatedImages[index] = { imageUrl: "", isPrimary: false }; // Ensure object exists
        updatedImages[index][field] = value;
    }
    setEditFormData(prev => ({ ...prev, images: updatedImages }));
  };

  const addEditImageField = () => {
    setEditFormData(prev => ({ ...prev, images: [...(prev.images || []), { imageUrl: "", isPrimary: false }] }));
  };

  const removeEditImageField = (index: number) => {
    if (editFormData.images && editFormData.images.length > 1) {
      const updatedImages = editFormData.images.filter((_, i) => i !== index);
      if (!updatedImages.find(img => img.isPrimary) && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }
      setEditFormData(prev => ({ ...prev, images: updatedImages }));
    }
  };
  
  const handleEditMultiSelectChange = (field: 'colors' | 'sizes', selectedIds: string[]) => {
    setEditFormData(prev => ({ ...prev, [field]: selectedIds }));
  };

  const handleEditDynamicListChange = (
    field: 'productBenefits' | 'shippingPoints' | 'careInstructions',
    index: number,
    value: string | ProductBenefit,
    subField?: keyof ProductBenefit
  ) => {
    const list = [...(editFormData[field] as any[] || [])];
    if (!list[index] && (field === 'productBenefits' || typeof value === 'object')) list[index] = {icon: "", text: ""}; // Ensure benefit object exists
    else if (!list[index]) list[index] = "";


    if (field === 'productBenefits' && typeof value === 'object' && subField) {
      (list[index] as ProductBenefit)[subField] = (value as any)[subField];
    } else if (typeof value === 'string'){
      list[index] = value;
    }
    setEditFormData(prev => ({ ...prev, [field]: list }));
  };

  const addEditDynamicListItem = (field: 'productBenefits' | 'shippingPoints' | 'careInstructions') => {
    let newItem: string | ProductBenefit = "";
    if(field === 'productBenefits') newItem = {icon: "", text: ""};
    setEditFormData(prev => ({ ...prev, [field]: [...(prev[field] as any[] || []), newItem] }));
  };

 const removeEditDynamicListItem = (field: 'productBenefits' | 'shippingPoints' | 'careInstructions', index: number) => {
    const currentList = editFormData[field] as any[];
    if (currentList && currentList.length > 1) {
        setEditFormData(prev => ({ ...prev, [field]: currentList.filter((_, i) => i !== index) }));
    }
  };
  
  const handleEditProductInformationChange = (key: keyof ProductInformation, value: string) => {
    setEditFormData(prev => ({
        ...prev,
        productInformation: {
            ...(prev.productInformation || {}),
            [key]: value
        }
    }));
  };


  const handleUpdateProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmittingProduct(true);
    try {
      // Basic validation (can be expanded)
      if (!editFormData.name || !editFormData.price || !editFormData.categoryId ) {
         toast({ title: "Validation Error", description: "Name, Price, and Category are required for update.", variant: "destructive" });
         setIsSubmittingProduct(false);
         return;
      }
      // Ensure images are in CreateProductImageDto format if they were changed
      const updatePayload: UpdateProductData = {
        ...editFormData,
        images: editFormData.images?.map(img => ({ imageUrl: img.imageUrl, isPrimary: img.isPrimary }))
      };

      const updatedProd = await updateProduct(editingProduct.id, updatePayload);
      setProductsData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          products: prev.products.map(p => p.id === updatedProd.id ? updatedProd : p),
        };
      });
      toast({ title: "Success!", description: `Product "${updatedProd.name}" updated successfully.` });
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      toast({ title: "Error updating product", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsSubmittingProduct(true); // Can use a different state like isDeleting if preferred
    try {
      await deleteProduct(productToDelete.id);
      setProductsData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          products: prev.products.filter(p => p.id !== productToDelete.id),
          totalItems: prev.totalItems -1,
        };
      });
      toast({ title: "Success!", description: `Product "${productToDelete.name}" deleted successfully.` });
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      toast({ title: "Error deleting product", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  if (loading && !productsData && !allColors.length) { // Adjust loading condition
    return <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]"><LoadingSpinner size="large" message="Loading product data..."/></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error} <Button onClick={() => fetchProductData()} className="ml-2">Retry</Button></div>;
  }
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog.</p>
        </div>
        <div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Filters and Search - To be connected with API capabilities */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products (API integration needed)..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled // Disabled until API supports search
              />
            </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Category ({categoryFilter === 'all' ? 'All' : categories.find(c=>c.id === categoryFilter)?.name || 'Unknown'})
                  <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCategoryFilter("all")}>All Categories</DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem 
                    key={category.id} 
                    onClick={() => setCategoryFilter(category.id)}
                    >
                    {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
          
          {/* Products Table */}
          {loading && !productsData && <div className="text-center py-4"><LoadingSpinner message="Loading products..."/></div>}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData?.products && productsData.products.length > 0 ? (
                  productsData.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={getPrimaryImage(product.images) || '/placeholder.svg'} 
                      alt={product.name}
                          className="h-12 w-12 object-cover rounded-md bg-muted"
                          onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {formatCurrency(product.price, product.currency)}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="ml-2 text-xs text-muted-foreground line-through">
                            {formatCurrency(product.originalPrice, product.currency)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.isNew && <Badge variant="outline" className="mr-1 border-green-500 text-green-600">New</Badge>}
                        {product.isBest && <Badge variant="outline" className="border-blue-500 text-blue-600">Best</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewReviews(product)}>
                              <Star className="mr-2 h-4 w-4 text-yellow-400" />
                              View Reviews
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      {loading ? 'Loading...' : 'No products found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* TODO: Pagination if productsData.totalPages > 1 */}
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Fill in the details for the new product.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProductSubmit} className="space-y-4 mt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" value={productFormData.name} onChange={handleFormInputChange} required />
              </div>
              <div>
                <Label htmlFor="price">Price (INR) <span className="text-red-500">*</span></Label>
                <Input id="price" name="price" type="number" value={productFormData.price} onChange={handleFormInputChange} required step="0.01"/>
              </div>
               <div>
                <Label htmlFor="originalPrice">Original Price (INR)</Label>
                <Input id="originalPrice" name="originalPrice" type="number" value={productFormData.originalPrice || ''} onChange={handleFormInputChange} step="0.01"/>
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input id="discount" name="discount" type="number" value={productFormData.discount || ''} onChange={handleFormInputChange} step="0.01" />
              </div>
              <div>
                <Label htmlFor="saleEndsIn">Sale Ends In (days)</Label>
                <Input id="saleEndsIn" name="saleEndsIn" type="number" value={productFormData.saleEndsIn || ''} onChange={handleFormInputChange} />
              </div>
              <div>
                <Label htmlFor="fabric">Fabric</Label>
                <Select name="fabric" value={productFormData.fabric} onValueChange={(value) => setProductFormData(prev => ({ ...prev, fabric: value }))}>
                  <SelectTrigger id="fabric"><SelectValue placeholder="Select fabric" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                    <SelectItem value="Organza">Organza</SelectItem>
                    <SelectItem value="Crepe">Crepe</SelectItem>
                    <SelectItem value="Wool">Wool</SelectItem>
                    <SelectItem value="Reyan">Reyan</SelectItem>
                    <SelectItem value="Silk">Silk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="categoryId">Category <span className="text-red-500">*</span></Label>
                <Select name="categoryId" onValueChange={handleCategoryChange} value={productFormData.categoryId} required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isNew" name="isNew" checked={productFormData.isNew} onCheckedChange={(checked) => setProductFormData(prev => ({...prev, isNew: Boolean(checked)}))} />
                <Label htmlFor="isNew">New Product</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isBest" name="isBest" checked={productFormData.isBest} onCheckedChange={(checked) => setProductFormData(prev => ({...prev, isBest: Boolean(checked)}))} />
                <Label htmlFor="isBest">Best Seller</Label>
              </div>
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={productFormData.description} onChange={handleFormInputChange} />
            </div>

            {/* Images - Simplified for now */}
            <div className="space-y-2">
              <Label>Images <span className="text-red-500">*</span> (At least one primary image required)</Label>
              {productFormData.images.map((img, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                  <Input 
                    type="url" 
                    placeholder="Image URL" 
                    value={img.imageUrl} 
                    onChange={(e) => handleImageChange(index, 'imageUrl', e.target.value)} 
                    required={index === 0} // First image URL is required
                    className="flex-grow"
                  />
                  <div className="flex items-center space-x-2">
                     <Checkbox 
                        id={`isPrimary-${index}`} 
                        checked={img.isPrimary} 
                        onCheckedChange={(checked) => handleImageChange(index, 'isPrimary', Boolean(checked))} />
                     <Label htmlFor={`isPrimary-${index}`}>Primary</Label>
                  </div>
                  {productFormData.images.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeImageField(index)}><X className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addImageField}><Plus className="mr-2 h-4 w-4"/>Add Image URL</Button>
            </div>
            
            {/* Colors Selection */}
             <div>
                <Label>Colors</Label>
                <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md min-h-[40px]">
                    {allColors.map(color => (
                        <Button 
                            key={color.id} 
                            type="button"
                            variant={productFormData.colors.includes(color.id) ? "default" : "outline"}
                            onClick={() => {
                                const selected = productFormData.colors.includes(color.id);
                                handleMultiSelectChange('colors', 
                                    selected 
                                        ? productFormData.colors.filter(id => id !== color.id) 
                                        : [...productFormData.colors, color.id]
                                );
                            }}
                            className="h-auto text-xs px-2 py-1"
                        >
                            <span className="w-3 h-3 rounded-full mr-1.5 border" style={{ backgroundColor: color.hexCode }}></span>
                            {color.name}
                        </Button>
                    ))}
                    {allColors.length === 0 && <p className="text-xs text-muted-foreground">No colors available or loading...</p>}
                </div>
            </div>

            {/* Sizes Selection */}
            <div>
                <Label>Sizes</Label>
                <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md min-h-[40px]">
                    {allSizes.map(size => (
                        <Button 
                            key={size.id} 
                            type="button"
                            variant={productFormData.sizes.includes(size.id) ? "default" : "outline"}
                            onClick={() => {
                                const selected = productFormData.sizes.includes(size.id);
                                handleMultiSelectChange('sizes', 
                                    selected 
                                        ? productFormData.sizes.filter(id => id !== size.id) 
                                        : [...productFormData.sizes, size.id]
                                );
                            }}
                             className="h-auto text-xs px-2 py-1"
                        >
                            {size.label} ({size.value})
                        </Button>
                    ))}
                     {allSizes.length === 0 && <p className="text-xs text-muted-foreground">No sizes available or loading...</p>}
                </div>
            </div>

            {/* Product Information (Dynamic Key-Value) */}
            <div>
                <Label>Product Information</Label>
                {Object.keys(productFormData.productInformation).map(key => (
                    <div key={key} className="flex items-center gap-2 mt-1">
                        <Input value={key.replace(/_/g, ' ')} disabled className="w-1/3 capitalize"/>
                        <Input 
                            placeholder={`Enter ${key.replace(/_/g, ' ')}`} 
                            value={productFormData.productInformation[key as keyof ProductInformation] || ''} 
                            onChange={(e) => handleProductInformationChange(key as keyof ProductInformation, e.target.value)} 
                        />
                    </div>
                ))}
                 {/* TODO: Add button to add custom ProductInformation fields if API supports it */}
            </div>
            
            {/* Product Benefits (Dynamic icon-text list) */}
            <div className="space-y-2">
                <Label>Product Benefits</Label>
                {productFormData.productBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                        <Input 
                            placeholder="Icon (e.g. 'clock')" 
                            value={benefit.icon} 
                            onChange={(e) => handleDynamicListChange('productBenefits', index, { ...benefit, icon: e.target.value }, 'icon')} 
                            className="w-1/3"
                        />
                        <Input 
                            placeholder="Benefit text" 
                            value={benefit.text} 
                            onChange={(e) => handleDynamicListChange('productBenefits', index, { ...benefit, text: e.target.value }, 'text')} 
                            className="flex-grow"
                        />
                        {productFormData.productBenefits.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('productBenefits', index)}><X className="h-4 w-4"/></Button>
                        )}
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => addDynamicListItem('productBenefits' )}><Plus className="mr-2 h-4 w-4"/>Add Benefit</Button>
            </div>
            
            {/* Shipping Points (Dynamic text list) */}
            <div className="space-y-2">
                <Label>Shipping Points</Label>
                {productFormData.shippingPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                        <Input 
                            placeholder="Shipping point" 
                            value={point} 
                            onChange={(e) => handleDynamicListChange('shippingPoints', index, e.target.value)} 
                            className="flex-grow"
                        />
                        {productFormData.shippingPoints.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('shippingPoints', index)}><X className="h-4 w-4"/></Button>
                        )}
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => addDynamicListItem('shippingPoints' )}><Plus className="mr-2 h-4 w-4"/>Add Shipping Point</Button>
            </div>

            {/* Care Instructions (Dynamic text list) */}
             <div className="space-y-2">
                <Label>Care Instructions</Label>
                {productFormData.careInstructions.map((instruction, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                        <Input 
                            placeholder="Care instruction" 
                            value={instruction} 
                            onChange={(e) => handleDynamicListChange('careInstructions', index, e.target.value)} 
                            className="flex-grow"
                        />
                        {productFormData.careInstructions.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('careInstructions', index)}><X className="h-4 w-4"/></Button>
                      )}
                    </div>
              ))}
                <Button type="button" variant="outline" onClick={() => addDynamicListItem('careInstructions' )}><Plus className="mr-2 h-4 w-4"/>Add Care Instruction</Button>
            </div>

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmittingProduct}>
                {isSubmittingProduct ? <LoadingSpinner size="small" /> : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedProduct.name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Image Gallery Section */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg mb-2">Product Images</h3>
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.images.map(img => (
                            <a key={img.id} href={img.imageUrl} target="_blank" rel="noopener noreferrer">
                                <img 
                                    src={img.imageUrl} 
                                    alt={`${selectedProduct.name} - ${img.id}`}
                                    className="rounded-lg object-cover aspect-square hover:opacity-80 transition-opacity"
                                    onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                                />
                             </a>
                        ))}
                        </div>
                    ) : <p className="text-muted-foreground">No images available.</p>}
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-2">Product Details</h3>
                    <p><strong className="font-medium">Price:</strong> {formatCurrency(selectedProduct.price, selectedProduct.currency)}
                        {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && 
                            <span className="ml-2 text-sm text-muted-foreground line-through">{formatCurrency(selectedProduct.originalPrice, selectedProduct.currency)}</span>
                        }
                        {selectedProduct.discount && <Badge className="ml-2 bg-red-500 text-white">{selectedProduct.discount}% OFF</Badge>}
                    </p>
                    {selectedProduct.saleEndsIn && <p className="text-sm text-orange-600"><Flame className="inline h-4 w-4 mr-1"/> Sale ends in {selectedProduct.saleEndsIn} days</p>}
                    <p><strong className="font-medium">Category:</strong> {selectedProduct.category?.name || 'N/A'}</p>
                    <p><strong className="font-medium">Fabric:</strong> {selectedProduct.fabric || 'N/A'}</p>
                    <p><strong className="font-medium">Rating:</strong> {selectedProduct.rating} stars</p>
                    {selectedProduct.isNew && <Badge variant="default" className="bg-green-500 hover:bg-green-600"><Sparkles className="h-3 w-3 mr-1"/> New Product</Badge>}
                    {selectedProduct.isBest && <Badge variant="default" className="bg-blue-500 hover:bg-blue-600"><Flame className="h-3 w-3 mr-1"/> Best Seller</Badge>}

                    <div className="mt-3 prose prose-sm max-w-none">
                        <h4 className="font-medium">Description:</h4>
                        <p>{selectedProduct.description || 'No description provided.'}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {selectedProduct.productInformation && Object.keys(selectedProduct.productInformation).length > 0 && (
                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><Info className="h-4 w-4 mr-2 text-primary"/>Product Information</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {Object.entries(selectedProduct.productInformation).map(([key, value]) => value && (
                                <div key={key}><strong className="capitalize font-medium">{key.replace(/_/g, ' ')}:</strong> {value}</div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedProduct.productBenefits && selectedProduct.productBenefits.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><PackageCheck className="h-4 w-4 mr-2 text-primary"/>Product Benefits</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedProduct.productBenefits.map((benefit, index) => (
                                <li key={index}>{benefit.text}</li> 
                            ))}
                        </ul>
                    </div>
                )}

                {selectedProduct.shippingPoints && selectedProduct.shippingPoints.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><Truck className="h-4 w-4 mr-2 text-primary"/>Shipping Information</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedProduct.shippingPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {selectedProduct.careInstructions && selectedProduct.careInstructions.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><ShieldCheck className="h-4 w-4 mr-2 text-primary"/>Care Instructions</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedProduct.careInstructions.map((instruction, index) => (
                                <li key={index}>{instruction}</li>
                            ))}
                        </ul>
                          </div>
                )}

                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><Tag className="h-4 w-4 mr-2 text-primary"/>Available Colors</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedProduct.colors.map(color => (
                                <Badge key={color.id} variant="outline" style={{ borderColor: color.hexCode, color: color.hexCode }}>
                                  <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: color.hexCode }}></span>
                                  {color.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><Tag className="h-4 w-4 mr-2 text-primary"/>Available Sizes</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedProduct.sizes.map(size => (
                                <Badge key={size.id} variant="outline">{size.label} ({size.value.toUpperCase()})</Badge>
                            ))}
                        </div>
                    </div>
                )}
                 <p className="text-xs text-muted-foreground pt-4">
                    Product ID: {selectedProduct.id}<br/>
                    Last Updated: {new Date(selectedProduct.updatedAt).toLocaleString()}
                </p>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingProduct(null); // Clear editing product when dialog is closed
            setEditFormData({}); // Reset form
          }
          setIsEditModalOpen(isOpen);
        }}>
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product: {editingProduct.name}</DialogTitle>
              <DialogDescription>
                Update the details of the product. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProductSubmit} className="space-y-4 py-4">
              {/* Re-use or adapt form fields from Add Product Modal */}
              {/* General Information Section */}
              <Card>
                <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">Product Name</Label>
                      <Input id="edit-name" name="name" value={editFormData.name || ""} onChange={handleEditFormInputChange} placeholder="e.g. Elegant Silk Saree" />
                    </div>
                    <div>
                      <Label htmlFor="edit-price">Price ({editFormData.currency || "INR"})</Label>
                      <Input id="edit-price" name="price" type="number" value={editFormData.price || 0} onChange={handleEditFormInputChange} placeholder="e.g. 2999" />
                    </div>
                  </div>
                  {/* ... (include other fields like originalPrice, discount, saleEndsIn, currency - adapt from add product form) ... */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit-originalPrice">Original Price ({editFormData.currency || "INR"}) (Optional)</Label>
                        <Input id="edit-originalPrice" name="originalPrice" type="number" value={editFormData.originalPrice || ""} onChange={handleEditFormInputChange} placeholder="e.g. 3999"/>
                    </div>
                    <div>
                        <Label htmlFor="edit-discount">Discount (%) (Optional)</Label>
                        <Input id="edit-discount" name="discount" type="number" value={editFormData.discount || ""} onChange={handleEditFormInputChange} placeholder="e.g. 10 for 10%"/>
                    </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit-saleEndsIn">Sale Ends In (days) (Optional)</Label>
                        <Input id="edit-saleEndsIn" name="saleEndsIn" type="number" value={editFormData.saleEndsIn || ""} onChange={handleEditFormInputChange} placeholder="e.g. 7"/>
                    </div>
                     <div>
                      <Label htmlFor="edit-currency">Currency</Label>
                      <Input id="edit-currency" name="currency" value={editFormData.currency || "INR"} onChange={handleEditFormInputChange} placeholder="e.g. INR" />
                    </div>
                   </div>

                  <div>
                    <Label htmlFor="edit-categoryId">Category</Label>
                    <Select name="categoryId" value={editFormData.categoryId || ""} onValueChange={handleEditCategoryChange}>
                      <SelectTrigger id="edit-categoryId"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-fabric">Fabric</Label>
                    <Select name="fabric" value={editFormData.fabric || ""} onValueChange={(value) => setEditFormData(prev => ({ ...prev, fabric: value }))}>
                      <SelectTrigger id="edit-fabric"><SelectValue placeholder="Select fabric" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cotton">Cotton</SelectItem>
                        <SelectItem value="Organza">Organza</SelectItem>
                        <SelectItem value="Crepe">Crepe</SelectItem>
                        <SelectItem value="Wool">Wool</SelectItem>
                        <SelectItem value="Reyan">Reyan</SelectItem>
                        <SelectItem value="Silk">Silk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-rating">Rating (0-5)</Label>
                    <Input id="edit-rating" name="rating" type="number" step="0.1" min="0" max="5" value={editFormData.rating || 0} onChange={handleEditFormInputChange} placeholder="e.g. 4.5" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="edit-isBest" name="isBest" checked={editFormData.isBest || false} onCheckedChange={(checked) => setEditFormData(prev => ({...prev, isBest: !!checked}))} />
                    <Label htmlFor="edit-isBest">Best Seller</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="edit-isNew" name="isNew" checked={editFormData.isNew || false} onCheckedChange={(checked) => setEditFormData(prev => ({...prev, isNew: !!checked}))} />
                    <Label htmlFor="edit-isNew">New Arrival</Label>
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea id="edit-description" name="description" value={editFormData.description || ""} onChange={handleEditFormInputChange} placeholder="Detailed product description..." />
                  </div>
                </CardContent>
              </Card>

              {/* Images Section - Adapt from Add Product */}
              <Card>
                <CardHeader><CardTitle>Product Images</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(editFormData.images || []).map((img, index) => (
                    <div key={index} className="flex items-end gap-2 border p-2 rounded">
                      <div className="flex-grow">
                        <Label htmlFor={`edit-imageUrl-${index}`}>Image URL {index + 1}</Label>
                        <Input id={`edit-imageUrl-${index}`} value={img.imageUrl} onChange={(e) => handleEditImageChange(index, 'imageUrl', e.target.value)} placeholder="https://example.com/image.jpg" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`edit-isPrimary-${index}`} checked={img.isPrimary} onCheckedChange={(checked) => handleEditImageChange(index, 'isPrimary', !!checked)} />
                        <Label htmlFor={`edit-isPrimary-${index}`}>Primary</Label>
                      </div>
                      { (editFormData.images || []).length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeEditImageField(index)}><X className="h-4 w-4"/></Button> }
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addEditImageField}><Plus className="mr-2 h-4 w-4" /> Add Image</Button>
                </CardContent>
              </Card>
              
              {/* Colors & Sizes Section - Adapt from Add Product */}
              <Card>
                  <CardHeader><CardTitle>Colors & Sizes</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                          <Label>Available Colors</Label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-1">
                              {allColors.map(color => (
                                  <div key={color.id} className="flex items-center space-x-2">
                                      <Checkbox
                                          id={`edit-color-${color.id}`}
                                          checked={(editFormData.colors || []).includes(color.id)}
                                          onCheckedChange={(checked) => {
                                              const currentColors = editFormData.colors || [];
                                              const newColors = checked ? [...currentColors, color.id] : currentColors.filter(id => id !== color.id);
                                              handleEditMultiSelectChange('colors', newColors);
                                          }}
                                      />
                                      <Label htmlFor={`edit-color-${color.id}`} className="flex items-center">
                                        <span style={{backgroundColor: color.hexCode, width: '12px', height: '12px', borderRadius: '50%', marginRight: '8px', border: '1px solid #ccc' }}></span>
                                        {color.name}
                                      </Label>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div>
                          <Label>Available Sizes</Label>
                           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-1">
                              {allSizes.map(size => (
                                  <div key={size.id} className="flex items-center space-x-2">
                                      <Checkbox
                                          id={`edit-size-${size.id}`}
                                          checked={(editFormData.sizes || []).includes(size.id)}
                                          onCheckedChange={(checked) => {
                                              const currentSizes = editFormData.sizes || [];
                                              const newSizes = checked ? [...currentSizes, size.id] : currentSizes.filter(id => id !== size.id);
                                              handleEditMultiSelectChange('sizes', newSizes);
                                          }}
                                      />
                                      <Label htmlFor={`edit-size-${size.id}`}>{size.label}</Label>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </CardContent>
              </Card>

              {/* Product Details Section (Benefits, Information, Shipping, Care) - Adapt from Add Product */}
              {/* Example for Product Benefits */}
              <Card>
                <CardHeader><CardTitle>Product Benefits</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(editFormData.productBenefits || []).map((benefit, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end border p-2 rounded">
                      <div>
                        <Label htmlFor={`edit-benefit-icon-${index}`}>Icon {index + 1}</Label>
                        <Input id={`edit-benefit-icon-${index}`} value={benefit.icon} onChange={(e) => handleEditDynamicListChange('productBenefits', index, { ...benefit, icon: e.target.value }, 'icon')} placeholder="e.g. clock, shield-check"/>
                      </div>
                      <div>
                        <Label htmlFor={`edit-benefit-text-${index}`}>Text {index + 1}</Label>
                        <Input id={`edit-benefit-text-${index}`} value={benefit.text} onChange={(e) => handleEditDynamicListChange('productBenefits', index, { ...benefit, text: e.target.value }, 'text')} placeholder="e.g. Fast Delivery" />
                      </div>
                      { (editFormData.productBenefits || []).length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeEditDynamicListItem('productBenefits', index)}><X className="h-4 w-4"/></Button> }
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addEditDynamicListItem('productBenefits')}><Plus className="mr-2 h-4 w-4" /> Add Benefit</Button>
                </CardContent>
              </Card>
              
              {/* Product Information - adapt from add product form */}
                <Card>
                    <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {Object.keys(initialProductFormData.productInformation).map((key) => (
                            <div key={`edit-info-${key}`}>
                                <Label htmlFor={`edit-info-${key}`}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                                <Input 
                                    id={`edit-info-${key}`} 
                                    name={key} 
                                    value={(editFormData.productInformation as any)?.[key] || ""} 
                                    onChange={(e) => handleEditProductInformationChange(key as keyof ProductInformation, e.target.value)}
                                    placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Shipping Points - adapt from add product form */}
                <Card>
                    <CardHeader><CardTitle>Shipping Points</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {(editFormData.shippingPoints || []).map((point, index) => (
                            <div key={`edit-shipping-${index}`} className="flex items-center gap-2">
                                <Input 
                                    id={`edit-shipping-${index}`} 
                                    value={point} 
                                    onChange={(e) => handleEditDynamicListChange('shippingPoints', index, e.target.value)}
                                    placeholder={`Shipping point ${index + 1}`}
                                    className="flex-grow"
                                />
                                { (editFormData.shippingPoints || []).length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeEditDynamicListItem('shippingPoints', index)}><X className="h-4 w-4"/></Button> }
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addEditDynamicListItem('shippingPoints')}><Plus className="mr-2 h-4 w-4"/> Add Shipping Point</Button>
                    </CardContent>
                </Card>

                {/* Care Instructions - adapt from add product form */}
                <Card>
                    <CardHeader><CardTitle>Care Instructions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {(editFormData.careInstructions || []).map((instruction, index) => (
                            <div key={`edit-care-${index}`} className="flex items-center gap-2">
                                <Input 
                                    id={`edit-care-${index}`} 
                                    value={instruction} 
                                    onChange={(e) => handleEditDynamicListChange('careInstructions', index, e.target.value)}
                                    placeholder={`Care instruction ${index + 1}`}
                                    className="flex-grow"
                                />
                                { (editFormData.careInstructions || []).length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeEditDynamicListItem('careInstructions', index)}><X className="h-4 w-4"/></Button> }
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addEditDynamicListItem('careInstructions')}><Plus className="mr-2 h-4 w-4"/> Add Care Instruction</Button>
                    </CardContent>
                </Card>


              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmittingProduct}>
                  {isSubmittingProduct ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the product "{productToDelete.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => setProductToDelete(null)}>Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={confirmDeleteProduct} disabled={isSubmittingProduct}>
                {isSubmittingProduct ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Product Reviews Modal */}
      {selectedProductForReviews && (
        <Dialog open={isReviewsModalOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedProductForReviews(null);
            setReviewsForProduct(null);
          }
          setIsReviewsModalOpen(isOpen);
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Reviews for: {selectedProductForReviews.name}</DialogTitle>
              <DialogDescription>
                Showing customer feedback for this product.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              {loadingReviews ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner message="Loading reviews..." />
                </div>
              ) : reviewsForProduct && reviewsForProduct.length > 0 ? (
                <ul className="space-y-4">
                  {reviewsForProduct.map(review => (
                    <li key={review.id} className="p-3 border rounded-md bg-muted/30">
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                      <p className="text-xs text-muted-foreground mt-2 text-right">Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-8">No reviews yet for this product.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewsModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Products;

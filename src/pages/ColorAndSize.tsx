import { useEffect, useState, FormEvent } from "react";
import {
  getSizes,
  addSize,
  updateSize,
  deleteSize,
  getColors,
  addColor,
  updateColor,
  deleteColor,
  Size,
  Color,
  CreateSizeData,
  UpdateSizeData,
  CreateColorData,
  UpdateColorData,
} from "@/services/colorAndSizeService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
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
import { Edit2, Trash2, Plus } from 'lucide-react';

const ColorAndSize = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loadingSizes, setLoadingSizes] = useState<boolean>(true);
  const [loadingColors, setLoadingColors] = useState<boolean>(true);
  const [errorSizes, setErrorSizes] = useState<string | null>(null);
  const [errorColors, setErrorColors] = useState<string | null>(null);

  // State for Size CRUD
  const [showSizeForm, setShowSizeForm] = useState<boolean>(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [sizeFormData, setSizeFormData] = useState<CreateSizeData | UpdateSizeData>({ label: "", value: "" });
  const [isSubmittingSize, setIsSubmittingSize] = useState<boolean>(false);

  // State for Color CRUD
  const [showColorForm, setShowColorForm] = useState<boolean>(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [colorFormData, setColorFormData] = useState<CreateColorData | UpdateColorData>({ name: "", value: "", hexCode: "" });
  const [isSubmittingColor, setIsSubmittingColor] = useState<boolean>(false);

  const { toast } = useToast();

  const fetchSizesData = async () => {
    try {
      setLoadingSizes(true);
      const sizesData = await getSizes();
      setSizes(sizesData);
    } catch (err: any) {
      setErrorSizes(err.message);
      toast({ title: "Error fetching sizes", description: err.message, variant: "destructive" });
    } finally {
      setLoadingSizes(false);
    }
  };

  const fetchColorsData = async () => {
    try {
      setLoadingColors(true);
      const colorsData = await getColors();
      setColors(colorsData);
    } catch (err: any) {
      setErrorColors(err.message);
      toast({ title: "Error fetching colors", description: err.message, variant: "destructive" });
    } finally {
      setLoadingColors(false);
    }
  };

  useEffect(() => {
    fetchSizesData();
    fetchColorsData();
  }, []);

  // Size Form Handlers
  const handleSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSizeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingSize(true);
    try {
      if (editingSize) {
        const updated = await updateSize(editingSize.id, sizeFormData as UpdateSizeData);
        setSizes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast({ title: "Success!", description: "Size updated successfully." });
      } else {
        const added = await addSize(sizeFormData as CreateSizeData);
        setSizes((prev) => [added, ...prev]);
        toast({ title: "Success!", description: "Size added successfully." });
      }
      setShowSizeForm(false);
      setEditingSize(null);
      setSizeFormData({ label: "", value: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not save size.", variant: "destructive" });
    } finally {
      setIsSubmittingSize(false);
    }
  };

  const handleEditSize = (size: Size) => {
    setEditingSize(size);
    setSizeFormData({ label: size.label, value: size.value });
    setShowSizeForm(true);
  };

  const handleDeleteSize = async (sizeId: string) => {
    try {
      await deleteSize(sizeId);
      setSizes((prev) => prev.filter((s) => s.id !== sizeId));
      toast({ title: "Success!", description: "Size deleted successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not delete size.", variant: "destructive" });
    }
  };

  // Color Form Handlers
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setColorFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingColor(true);
    try {
      if (editingColor) {
        const updated = await updateColor(editingColor.id, colorFormData as UpdateColorData);
        setColors((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast({ title: "Success!", description: "Color updated successfully." });
      } else {
        const added = await addColor(colorFormData as CreateColorData);
        setColors((prev) => [added, ...prev]);
        toast({ title: "Success!", description: "Color added successfully." });
      }
      setShowColorForm(false);
      setEditingColor(null);
      setColorFormData({ name: "", value: "", hexCode: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not save color.", variant: "destructive" });
    } finally {
      setIsSubmittingColor(false);
    }
  };

  const handleEditColor = (color: Color) => {
    setEditingColor(color);
    setColorFormData({ name: color.name, value: color.value, hexCode: color.hexCode });
    setShowColorForm(true);
  };

  const handleDeleteColor = async (colorId: string) => {
    try {
      await deleteColor(colorId);
      setColors((prev) => prev.filter((c) => c.id !== colorId));
      toast({ title: "Success!", description: "Color deleted successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not delete color.", variant: "destructive" });
    }
  };
  

  if (loadingSizes || loadingColors) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" message="Loading data..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      {/* Sizes Section */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Manage Sizes</h1>
          <Button onClick={() => { setShowSizeForm(true); setEditingSize(null); setSizeFormData({ label: "", value: "" });}}>
            <Plus className="mr-2 h-4 w-4" /> Add Size
          </Button>
        </div>

        {showSizeForm && (
          <form onSubmit={handleSizeFormSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              {editingSize ? "Edit Size" : "Add New Size"}
            </h2>
            <div>
              <Label htmlFor="sizeLabel">Label</Label>
              <Input id="sizeLabel" name="label" value={sizeFormData.label || ''} onChange={handleSizeInputChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="sizeValue">Value</Label>
              <Input id="sizeValue" name="value" value={sizeFormData.value || ''} onChange={handleSizeInputChange} required className="mt-1" />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmittingSize}>
                {isSubmittingSize ? <LoadingSpinner size="small" /> : (editingSize ? "Update Size" : "Add Size")}
              </Button>
              <Button variant="outline" type="button" onClick={() => { setShowSizeForm(false); setEditingSize(null); setSizeFormData({ label: "", value: "" }); }} disabled={isSubmittingSize}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {errorSizes && <p className="p-4 text-red-500 text-center">Error: {errorSizes}</p>}
        {!errorSizes && sizes.length === 0 && !loadingSizes && !showSizeForm && (
          <p className="text-center text-gray-500 py-4">No sizes found. Click "Add Size" to create one.</p>
        )}
        {!errorSizes && sizes.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizes.map((size) => (
                  <TableRow key={size.id}>
                    <TableCell>{size.label}</TableCell>
                    <TableCell>{size.value}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditSize(size)} className="text-blue-600 hover:text-blue-800">
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
                              This action cannot be undone. This will permanently delete the size "{size.label} ({size.value})".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSize(size.id)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Manage Colors</h1>
          <Button onClick={() => { setShowColorForm(true); setEditingColor(null); setColorFormData({ name: "", value: "", hexCode: "" }); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Color
          </Button>
        </div>

        {showColorForm && (
          <form onSubmit={handleColorFormSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              {editingColor ? "Edit Color" : "Add New Color"}
            </h2>
            <div>
              <Label htmlFor="colorName">Name</Label>
              <Input id="colorName" name="name" value={colorFormData.name || ''} onChange={handleColorInputChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="colorValue">Value (e.g., red, blue)</Label>
              <Input id="colorValue" name="value" value={colorFormData.value || ''} onChange={handleColorInputChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="colorHexCode">Hex Code (e.g., #FF0000)</Label>
              <Input id="colorHexCode" name="hexCode" value={colorFormData.hexCode || ''} onChange={handleColorInputChange} required className="mt-1" />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmittingColor}>
                {isSubmittingColor ? <LoadingSpinner size="small" /> : (editingColor ? "Update Color" : "Add Color")}
              </Button>
              <Button variant="outline" type="button" onClick={() => { setShowColorForm(false); setEditingColor(null); setColorFormData({ name: "", value: "", hexCode: "" }); }} disabled={isSubmittingColor}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {errorColors && <p className="p-4 text-red-500 text-center">Error: {errorColors}</p>}
        {!errorColors && colors.length === 0 && !loadingColors && !showColorForm && (
          <p className="text-center text-gray-500 py-4">No colors found. Click "Add Color" to create one.</p>
        )}
        {!errorColors && colors.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Hex Code</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colors.map((color) => (
                  <TableRow key={color.id}>
                    <TableCell>{color.name}</TableCell>
                    <TableCell>{color.value}</TableCell>
                    <TableCell>{color.hexCode}</TableCell>
                    <TableCell>
                      <div style={{ backgroundColor: color.hexCode, width: '20px', height: '20px', border: '1px solid #ccc', borderRadius: '4px' }}></div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="icon" onClick={() => handleEditColor(color)} className="text-blue-600 hover:text-blue-800">
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
                              This action cannot be undone. This will permanently delete the color "{color.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteColor(color.id)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorAndSize;

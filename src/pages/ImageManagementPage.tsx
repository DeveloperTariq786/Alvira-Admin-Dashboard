import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { uploadImageAndGetURL } from '@/services/storageService'; // Assuming alias @ is src
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, Trash2, ImageUp, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";

interface UploadedImage {
  name: string;
  url: string;
  path: string; // Store path for potential delete functionality
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const ImageManagementPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressMap, setUploadProgressMap] = useState<Map<string, UploadProgress>>(new Map());
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [overallError, setOverallError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load images from local storage on component mount
  useEffect(() => {
    const storedImages = localStorage.getItem('uploadedImagesAlvira');
    if (storedImages) {
      setUploadedImages(JSON.parse(storedImages));
    }
  }, []);

  // Save images to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('uploadedImagesAlvira', JSON.stringify(uploadedImages));
  }, [uploadedImages]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const validFiles = filesArray.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: `Invalid File Type: ${file.name}`,
            description: 'Please select image files only (e.g., PNG, JPG, GIF).',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      });
      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]); // Append new valid files
      setOverallError(null);
      // event.target.value = ""; // Allow re-selecting same files if needed after an error or modification
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      setOverallError('Please select one or more images to upload.');
      toast({ title: 'No images selected', description: 'Please select image files first.', variant: 'default' });
      return;
    }

    setIsUploading(true);
    setOverallError(null);
    const currentUploads = new Map<string, UploadProgress>();

    for (const file of selectedFiles) {
      currentUploads.set(file.name, { fileName: file.name, progress: 0, status: 'uploading' });
      setUploadProgressMap(new Map(currentUploads)); // Update map for UI

      try {
        const imageData = await uploadImageAndGetURL(file, 'uploads', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          currentUploads.set(file.name, { ...currentUploads.get(file.name)!, progress: progress, status: 'uploading' });
          setUploadProgressMap(new Map(currentUploads));
        });
        
        setUploadedImages(prevImages => [imageData, ...prevImages]);
        currentUploads.set(file.name, { ...currentUploads.get(file.name)!, progress: 100, status: 'success' });
        setUploadProgressMap(new Map(currentUploads));
        toast({
          title: `Upload Successful: ${imageData.name}`,
          description: `${imageData.name} has been uploaded.`,
        });
      } catch (err: any) {
        currentUploads.set(file.name, { ...currentUploads.get(file.name)!, status: 'error', error: err.message });
        setUploadProgressMap(new Map(currentUploads));
        toast({
          title: `Upload Failed: ${file.name}`,
          description: err.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    }
    setSelectedFiles([]); // Clear selection after attempting all uploads
    const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = ""; // Reset file input visually
    setIsUploading(false);
    // Optionally clear progress map after a delay or user action
    // setTimeout(() => setUploadProgressMap(new Map()), 5000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Modern way: Clipboard API (requires secure context - HTTPS or localhost)
        await navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: 'Image URL copied to clipboard (modern method).' });
      } else {
        // Fallback way: document.execCommand (legacy, less secure, wider compatibility)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
        textArea.style.left = "-9999px"; // Move Ctextarea offscreen.
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            toast({ title: 'Copied!', description: 'Image URL copied to clipboard (fallback method).' });
          } else {
            throw new Error('Fallback copy command failed.');
          }
        } catch (err) {
          console.error('Fallback Copy Error:', err);
          toast({ title: 'Copy Failed', description: 'Could not copy URL using fallback method.', variant: 'destructive' });
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Overall Copy Error:', err);
      toast({ title: 'Copy Failed', description: 'Could not copy URL. Check browser console for details.', variant: 'destructive' });
    }
  };
  
  // Placeholder for delete functionality - requires storageService update
  const handleDeleteImage = (imagePath: string) => {
    // TODO: Implement delete functionality in storageService and call it here
    // For now, just remove from local state and localStorage
    setUploadedImages(prevImages => prevImages.filter(img => img.path !== imagePath));
    toast({ title: 'Image Removed (Locally)', description: 'Image removed from this list. Deletion from server is not yet implemented.' , variant: 'default'});
    // Example: deleteImageFromStorage(imagePath).then(() => ...).catch(() => ...);
  };


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Image Management</h1>
        <p className="text-muted-foreground text-lg">Upload new images and manage existing ones.</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><ImageUp className="mr-2 h-6 w-6 text-primary"/> Upload New Images</CardTitle>
          <CardDescription>Select one or more image files and click upload. Images will be stored in Firebase Storage.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-upload-input">Choose Image(s)</Label>
              <Input 
                id="image-upload-input" 
                type="file" 
                accept="image/*" 
                multiple // Allow multiple file selection
                onChange={handleFileChange} 
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>{selectedFiles.length} file(s) selected:</p>
                  <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                    {selectedFiles.map(file => <li key={file.name}>{file.name}</li>)}
                  </ul>
                </div>
              )}
            </div>
            
            {isUploading && Array.from(uploadProgressMap.values()).some(up => up.status === 'uploading') && (
              <div className="space-y-4 pt-2">
                <Label>Upload Progress:</Label>
                {Array.from(uploadProgressMap.values()).map(up => (
                  <div key={up.fileName} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <p className="truncate max-w-[70%]">{up.fileName}</p>
                      {up.status === 'uploading' && <p className="text-muted-foreground">{Math.round(up.progress)}%</p>}
                      {up.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {up.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    {(up.status === 'uploading' || (up.status==='error' && up.progress > 0) ) && <Progress value={up.progress} className="w-full h-2" />}
                     {up.status === 'error' && <p className="text-xs text-red-500">Error: {up.error}</p>}
                  </div>
                ))}
              </div>
            )}

            {overallError && (
              <Alert variant="destructive">
                <AlertTitle>Upload Error</AlertTitle>
                <AlertDescription>{overallError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isUploading || selectedFiles.length === 0} className="w-full md:w-auto">
              {isUploading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <ImageUp className="mr-2 h-4 w-4" />} 
              {isUploading ? `Uploading ${selectedFiles.length} file(s)...` : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Image(s)`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {uploadedImages.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Uploaded Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {uploadedImages.map((image, index) => (
              <Card key={`${image.path}-${index}`} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader className="p-0 relative">
                  <img 
                    src={image.url} 
                    alt={image.name} 
                    className="w-full h-48 object-cover aspect-video"
                    onError={(e) => { 
                        (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; 
                        (e.currentTarget as HTMLImageElement).alt = 'Error loading image';
                    }}
                  />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-medium truncate group-hover:whitespace-normal" title={image.name}>{image.name}</p>
                  <div className="flex items-center space-x-2">
                    <Input type="text" readOnly value={image.url} className="text-xs h-8" />
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(image.url)} title="Copy URL">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="p-2 border-t flex justify-between items-center">
                  <Button variant="outline" size="sm" asChild>
                    <a href={image.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View
                    </a>
                  </Button>
                   <Button variant="ghost" size="icon" onClick={() => handleDeleteImage(image.path)} title="Delete Image (Locally)" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
       {uploadedImages.length === 0 && !isUploading && (
         <div className="text-center text-muted-foreground py-10">
            <ImageUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No images uploaded yet.</h3>
            <p className="text-sm">Start by selecting image(s) and clicking the upload button.</p>
          </div>
       )}
    </div>
  );
};

export default ImageManagementPage; 
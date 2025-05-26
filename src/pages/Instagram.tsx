import React, { useState, useEffect, FormEvent } from 'react';
import {
  getInstagramPosts,
  createInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
  InstagramPost,
  InstagramPostsApiResponse,
  CreateInstagramPostData,
  UpdateInstagramPostData
} from '@/services/instagramService';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ExternalLink, PlusCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const initialCreatePostData: CreateInstagramPostData = {
  postId: "",
  link: "",
  imageUrl: "",
  alt: "",
};

const InstagramPage = () => {
  const [postsData, setPostsData] = useState<InstagramPostsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const { toast } = useToast();

  // CRUD Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);

  // Form and Selection States
  const [createPostData, setCreatePostData] = useState<CreateInstagramPostData>(initialCreatePostData);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [editPostData, setEditPostData] = useState<UpdateInstagramPostData>({});
  const [postToDelete, setPostToDelete] = useState<InstagramPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchPosts = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInstagramPosts(page, itemsPerPage);
      setPostsData(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error fetching Instagram posts',
        description: err.message || 'Could not retrieve posts.',
        variant: 'destructive',
      });
      setPostsData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]); // Removed toast from dependency array as it's stable

  const handleNextPage = () => {
    if (postsData && currentPage < postsData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Add Post Handlers
  const handleAddModalOpen = () => {
    setCreatePostData(initialCreatePostData); // Reset form
    setIsAddModalOpen(true);
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreatePostData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if(!createPostData.link || !createPostData.imageUrl || !createPostData.postId) {
        toast({title: "Validation Error", description: "Post ID, Link and Image URL are required.", variant: "destructive"});
        setIsSubmitting(false); return;
      }
      await createInstagramPost(createPostData);
      toast({ title: 'Success', description: 'Instagram post added successfully.' });
      setIsAddModalOpen(false);
      fetchPosts(1); // Refetch posts from page 1 to see the new one
      setCurrentPage(1);
    } catch (err: any) {
      toast({ title: 'Error adding post', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Post Handlers
  const handleEditModalOpen = (post: InstagramPost) => {
    setEditingPost(post);
    setEditPostData({
      postId: post.postId,
      link: post.link,
      imageUrl: post.imageUrl,
      alt: post.alt,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setIsSubmitting(true);
    try {
      if(!editPostData.link || !editPostData.imageUrl || !editPostData.postId) {
         toast({title: "Validation Error", description: "Post ID, Link and Image URL are required.", variant: "destructive"});
         setIsSubmitting(false); return;
      }
      await updateInstagramPost(editingPost.id, editPostData);
      toast({ title: 'Success', description: 'Instagram post updated successfully.' });
      setIsEditModalOpen(false);
      fetchPosts(currentPage); // Refetch current page to see updates
    } catch (err: any) {
      toast({ title: 'Error updating post', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Post Handlers
  const handleDeleteClick = (post: InstagramPost) => {
    setPostToDelete(post);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteInstagramPost(postToDelete.id);
      toast({ title: 'Success', description: 'Instagram post deleted successfully.' });
      setIsDeleteConfirmOpen(false);
      // Refetch or filter out locally
      const newTotalItems = (postsData?.totalItems || 1) - 1;
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
        fetchPosts(newTotalPages);
      } else if (postsData?.posts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        fetchPosts(currentPage-1);
      } else {
        fetchPosts(currentPage);
      }
      if (newTotalItems === 0) setPostsData(null); // Clear if no items left

    } catch (err: any) {
      toast({ title: 'Error deleting post', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setPostToDelete(null);
    }
  };


  return (
    <div className="space-y-6 p-4 md:p-6 bg-background text-foreground">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Instagram Feed</h1>
          <p className="text-muted-foreground text-lg">Manage your Alvira Instagram presence.</p>
        </div>
        <Button onClick={handleAddModalOpen} size="lg">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Instagram Post
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10 min-h-[400px]">
          <LoadingSpinner size="large" message="Loading Instagram posts..." />
        </div>
      )}
      {error && !loading && (
        <div className="text-center text-destructive py-10 min-h-[400px]">
          <p className="text-xl mb-2">Oops! Something went wrong.</p>
          <p className="mb-4">Error: {error}</p> 
          <Button onClick={() => fetchPosts(1)} variant="secondary" size="lg">Retry Loading</Button>
        </div>
      )}

      {!loading && !error && postsData && (
        <>
          {postsData.posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-20 min-h-[400px]">
              <h2 className="text-2xl font-semibold mb-3">No Posts Yet!</h2>
              <p className="mb-6">It looks like there are no Instagram posts to display. Why not add one?</p>
              <Button onClick={handleAddModalOpen} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Add First Post
             </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {postsData.posts.map((post) => (
                <Card key={post.id} className="overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg bg-card">
                  <div className="relative group">
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="block">
                        <img 
                            src={post.imageUrl || '/placeholder.svg'} 
                            alt={post.alt || 'Instagram post'}
                            className="w-full h-60 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                            onError={(e) => { 
                                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; 
                                (e.currentTarget as HTMLImageElement).alt = 'Error loading image';
                            }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                           <ExternalLink className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </a>
                    <div className="absolute top-2 right-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/70 hover:bg-background">
                                    <MoreVertical className="h-4 w-4 text-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditModalOpen(post)}>
                                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(post)} className="text-red-500 hover:!text-red-500 focus:text-red-500">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="flex-grow p-4">
                    <p className="text-base font-medium leading-tight h-12 overflow-hidden line-clamp-2 text-card-foreground">
                        {post.alt || "View on Instagram"}
                    </p>
                  </CardContent>
                  {/* Footer removed as per design, direct link on image and actions menu on top right */}
                </Card>
              ))}
            </div>
          )}

          {postsData.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-8">
              <Button 
                variant="outline" 
                size="default" 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1}
              >
                Previous Page
              </Button>
              <span className="text-sm text-muted-foreground p-2 px-4 border rounded-md">
                Page {postsData.page} of {postsData.totalPages}
              </span>
              <Button 
                variant="outline" 
                size="default" 
                onClick={handleNextPage} 
                disabled={currentPage === postsData.totalPages}
              >
                Next Page
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Post Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Instagram Post</DialogTitle>
            <DialogDescription>Fill in the details of the Instagram post.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="create-postId">Post ID (from Instagram URL)</Label>
              <Input id="create-postId" name="postId" value={createPostData.postId} onChange={handleCreateFormChange} placeholder="e.g. C6ECDyavfXK" required />
            </div>
            <div>
              <Label htmlFor="create-link">Instagram Link</Label>
              <Input id="create-link" name="link" type="url" value={createPostData.link} onChange={handleCreateFormChange} placeholder="https://www.instagram.com/p/C6ECDyavfXK/" required />
            </div>
            <div>
              <Label htmlFor="create-imageUrl">Image URL</Label>
              <Input id="create-imageUrl" name="imageUrl" type="url" value={createPostData.imageUrl} onChange={handleCreateFormChange} placeholder="https://example.com/image.jpg" required />
            </div>
            <div>
              <Label htmlFor="create-alt">Alternative Text (Caption)</Label>
              <Textarea id="create-alt" name="alt" value={createPostData.alt || ""} onChange={handleCreateFormChange} placeholder="Describe the image or post content..." />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null} Add Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      {editingPost && (
        <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setEditingPost(null);
          setIsEditModalOpen(isOpen);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Instagram Post</DialogTitle>
              <DialogDescription>Update the details of the post ID: {editingPost.postId}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-postId">Post ID</Label>
                <Input id="edit-postId" name="postId" value={editPostData.postId || ""} onChange={handleEditFormChange} required />
              </div>
              <div>
                <Label htmlFor="edit-link">Instagram Link</Label>
                <Input id="edit-link" name="link" type="url" value={editPostData.link || ""} onChange={handleEditFormChange} required />
              </div>
              <div>
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input id="edit-imageUrl" name="imageUrl" type="url" value={editPostData.imageUrl || ""} onChange={handleEditFormChange} required />
              </div>
              <div>
                <Label htmlFor="edit-alt">Alternative Text (Caption)</Label>
                <Textarea id="edit-alt" name="alt" value={editPostData.alt || ""} onChange={handleEditFormChange} />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null} Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {postToDelete && (
        <Dialog open={isDeleteConfirmOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setPostToDelete(null);
          setIsDeleteConfirmOpen(isOpen);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the Instagram post (ID: {postToDelete.postId})? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null} Delete Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InstagramPage; 
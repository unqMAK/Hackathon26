import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Trash2, File, Image, Code, Video, FileArchive } from 'lucide-react';
import { toast } from 'sonner';

interface TeamFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'code' | 'video' | 'archive' | 'other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'presentation' | 'code' | 'documentation' | 'design' | 'other';
}

const TeamFiles = () => {
  const [files, setFiles] = useState<TeamFile[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newFile, setNewFile] = useState({ name: '', type: 'document' as const, category: 'other' as const });

  useEffect(() => {
    // Load files from localStorage
    const savedFiles = localStorage.getItem('teamFiles');
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    } else {
      // Initialize with mock files
      const mockFiles: TeamFile[] = [
        {
          id: '1',
          name: 'Project Presentation.pptx',
          type: 'document',
          size: '5.2 MB',
          uploadedBy: 'Priya Sharma',
          uploadedAt: '2024-01-20',
          category: 'presentation'
        },
        {
          id: '2',
          name: 'main.py',
          type: 'code',
          size: '15 KB',
          uploadedBy: 'Rahul Verma',
          uploadedAt: '2024-01-21',
          category: 'code'
        },
        {
          id: '3',
          name: 'UI Mockups.fig',
          type: 'image',
          size: '8.7 MB',
          uploadedBy: 'Priya Sharma',
          uploadedAt: '2024-01-19',
          category: 'design'
        },
        {
          id: '4',
          name: 'Architecture_Documentation.pdf',
          type: 'document',
          size: '2.1 MB',
          uploadedBy: 'You',
          uploadedAt: '2024-01-22',
          category: 'documentation'
        }
      ];
      setFiles(mockFiles);
      localStorage.setItem('teamFiles', JSON.stringify(mockFiles));
    }
  }, []);

  const saveFiles = (updatedFiles: TeamFile[]) => {
    setFiles(updatedFiles);
    localStorage.setItem('teamFiles', JSON.stringify(updatedFiles));
  };

  const handleUploadFile = () => {
    if (!newFile.name) {
      toast.error('Please enter a file name');
      return;
    }

    const file: TeamFile = {
      id: Date.now().toString(),
      name: newFile.name,
      type: newFile.type,
      size: `${Math.floor(Math.random() * 10) + 1} MB`,
      uploadedBy: 'You',
      uploadedAt: new Date().toISOString().split('T')[0],
      category: newFile.category
    };

    saveFiles([...files, file]);
    setNewFile({ name: '', type: 'document', category: 'other' });
    setIsUploadDialogOpen(false);
    toast.success('File uploaded successfully!');
  };

  const handleDeleteFile = (id: string) => {
    saveFiles(files.filter(f => f.id !== id));
    toast.success('File deleted');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'image': return <Image className="h-5 w-5 text-green-500" />;
      case 'code': return <Code className="h-5 w-5 text-purple-500" />;
      case 'video': return <Video className="h-5 w-5 text-red-500" />;
      case 'archive': return <FileArchive className="h-5 w-5 text-yellow-500" />;
      default: return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'presentation': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'code': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'documentation': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'design': return 'bg-pink-500/10 text-pink-700 border-pink-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const filteredFiles = filterCategory === 'all' 
    ? files 
    : files.filter(f => f.category === filterCategory);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Files & Resources</CardTitle>
              <CardDescription>Share and manage project files with your team</CardDescription>
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-secondary to-secondary/80">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                  <DialogDescription>
                    Add a new file to share with your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileName">File Name *</Label>
                    <Input
                      id="fileName"
                      placeholder="document.pdf"
                      value={newFile.name}
                      onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fileType">File Type</Label>
                    <Select value={newFile.type} onValueChange={(value: any) => setNewFile({ ...newFile, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="archive">Archive</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newFile.category} onValueChange={(value: any) => setNewFile({ ...newFile, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presentation">Presentation</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUploadFile}>Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files found</p>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <Card key={file.id} className="hover-lift transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{file.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span>by {file.uploadedBy}</span>
                            <span>•</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={getCategoryColor(file.category)}>
                          {file.category}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamFiles;

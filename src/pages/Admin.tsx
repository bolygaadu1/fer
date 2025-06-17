import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import OrdersList from '@/components/admin/OrdersList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Download, FileText, Trash2 } from "lucide-react";
import { fileStorage } from '@/services/fileStorage';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderService } from '@/services/orderService';

const Admin = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showClearFilesDialog, setShowClearFilesDialog] = useState(false);
  const [showClearOrdersDialog, setShowClearOrdersDialog] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!adminLoggedIn) {
      navigate('/login');
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/login');
  };

  const downloadAllFiles = () => {
    const files = fileStorage.getAllFiles();
    
    if (files.length === 0) {
      toast.info("No files available to download");
      return;
    }
    
    toast.success(`Preparing ${files.length} files for download`);
    // In a real app, this would trigger a zip download or batch download process
  };

  const clearAllFiles = () => {
    fileStorage.clearAllFiles();
    toast.success("All uploaded files have been cleared");
    setShowClearFilesDialog(false);
  };

  const clearAllOrders = async () => {
    const success = await OrderService.deleteAllOrders();
    if (success) {
      toast.success("All orders have been cleared");
      setShowClearOrdersDialog(false);
      // Force reload the component to update UI
      window.location.reload();
    }
  };
  
  if (!isLoggedIn) {
    return null; // Don't render anything while checking auth state
  }

  return (
    <PageLayout>
      <div className="py-4 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-10 gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
                Manage orders and settings
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" /> Logout
            </Button>
          </div>
          
          <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 sm:mb-8 w-full sm:w-auto grid grid-cols-3 sm:flex">
              <TabsTrigger value="orders" className="text-xs sm:text-sm">Orders</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
              <TabsTrigger value="files" className="text-xs sm:text-sm">Files</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="bg-white p-3 sm:p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-6 gap-3">
                <h2 className="text-base sm:text-xl font-semibold">All Orders</h2>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto text-xs sm:text-sm"
                  onClick={() => setShowClearOrdersDialog(true)}
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" /> Clear All Orders
                </Button>
              </div>
              <OrdersList />
            </TabsContent>
            <TabsContent value="settings" className="bg-white p-3 sm:p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-6">Settings</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Data Storage</h3>
                  <p className="mt-1 text-gray-600 text-xs sm:text-sm">
                    Orders and files are stored in your browser's localStorage. This means data is local to each browser/device.
                    For shared data across multiple devices, you would need a database solution.
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-yellow-50 rounded-md border border-yellow-200">
                  <h3 className="font-medium text-yellow-800 text-sm sm:text-base">Important Note</h3>
                  <p className="mt-1 text-yellow-700 text-xs sm:text-sm">
                    localStorage is browser-specific. Orders placed on one device/browser won't be visible on another device/browser.
                    This is why you and your friend see different orders.
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Admin Credentials</h3>
                  <p className="mt-1 text-gray-600 text-xs sm:text-sm">Username: admin | Password: xerox123</p>
                  <p className="text-xs text-gray-500 mt-1">This is for demonstration purposes only. In a real app, you would use secure credential storage.</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="files" className="bg-white p-3 sm:p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-6 gap-3">
                <h2 className="text-base sm:text-xl font-semibold">All Uploaded Files</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 text-xs sm:text-sm"
                    onClick={downloadAllFiles}
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" /> Download All
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm"
                    onClick={() => setShowClearFilesDialog(true)}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" /> Clear All Files
                  </Button>
                </div>
              </div>
              <FilesManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Alert Dialog for clearing files */}
      <AlertDialog open={showClearFilesDialog} onOpenChange={setShowClearFilesDialog}>
        <AlertDialogContent className="mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm sm:text-base">Clear All Files</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to clear all uploaded files? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto text-xs sm:text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllFiles} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-xs sm:text-sm">
              Yes, Clear All Files
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for clearing orders */}
      <AlertDialog open={showClearOrdersDialog} onOpenChange={setShowClearOrdersDialog}>
        <AlertDialogContent className="mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm sm:text-base">Clear All Orders</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to clear all orders? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto text-xs sm:text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllOrders} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-xs sm:text-sm">
              Yes, Clear All Orders
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

// Simple files manager component
const FilesManager = () => {
  const [files, setFiles] = useState<Array<{name: string, size: number, type: string, path: string}>>([]);
  
  useEffect(() => {
    // Get all stored files
    const storedFiles = fileStorage.getAllFiles();
    setFiles(storedFiles);
  }, []);
  
  const handleFileDownload = (file: {path: string, name: string}) => {
    try {
      const storedFile = fileStorage.getFile(file.path);
      if (storedFile?.data) {
        // Create a URL for the blob
        const url = URL.createObjectURL(storedFile.data);
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        // Trigger download
        a.click();
        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Downloading ${file.name}`);
      } else {
        toast.error("File data not available");
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(`Failed to download ${file.name}`);
    }
  };
  
  return (
    <div>
      {files.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm sm:text-base">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-md gap-2 sm:gap-3">
              <div className="flex items-center min-w-0 flex-1">
                <FileText className="h-3 w-3 sm:h-5 sm:w-5 text-xerox-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB • {file.path}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 w-full sm:w-auto text-xs"
                onClick={() => handleFileDownload(file)}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Plus, LogOut, Loader2, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ChatDialog from '@/components/ChatDialog';

interface Resource {
  id: number;
  name: string;
  type: string;
  pricePerDay: number;
  location: string;
  capacity: string;
  description: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

interface Booking {
  id: number;
  farmerId: number;
  resourceId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  cropType: string;
}

function OwnerDashboardContent() {
  const { userData } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('resources');
  
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState<number | null>(null);
  
  const [resourceForm, setResourceForm] = useState({
    name: '',
    type: '',
    description: '',
    pricePerDay: '',
    capacity: '',
    location: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchMyResources();
    fetchMyBookings();
  }, []);

  const fetchMyResources = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/resources?ownerId=${userData.id}&limit=100`);
      const data = await response.json();
      setMyResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!userData) return;
    try {
      const response = await fetch(`/api/bookings?ownerId=${userData.id}&limit=100`);
      const data = await response.json();
      setMyBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userData.id,
          name: resourceForm.name,
          type: resourceForm.type,
          description: resourceForm.description,
          pricePerDay: parseFloat(resourceForm.pricePerDay),
          capacity: resourceForm.capacity,
          location: resourceForm.location,
          latitude: resourceForm.latitude ? parseFloat(resourceForm.latitude) : null,
          longitude: resourceForm.longitude ? parseFloat(resourceForm.longitude) : null,
          imageUrl: '/placeholder-equipment.jpg',
        }),
      });

      if (response.ok) {
        alert('Resource added successfully! Waiting for admin approval.');
        setShowAddDialog(false);
        setResourceForm({
          name: '',
          type: '',
          description: '',
          pricePerDay: '',
          capacity: '',
          location: '',
          latitude: '',
          longitude: '',
        });
        fetchMyResources();
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource');
    }
  };

  const handleDeleteResource = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/resources?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Resource deleted successfully');
        fetchMyResources();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const handleBookingAction = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert(`Booking ${status} successfully`);
        fetchMyBookings();
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleOpenChat = (bookingId: number) => {
    setSelectedBookingForChat(bookingId);
    setChatOpen(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AgriGo Owner</h1>
              <p className="text-sm text-muted-foreground">Welcome, {userData?.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="resources">My Equipment</TabsTrigger>
            <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">My Equipment</h2>
                <p className="text-muted-foreground">Manage your agricultural equipment listings</p>
              </div>
              
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Equipment</DialogTitle>
                    <DialogDescription>
                      List your agricultural equipment for farmers to rent
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddResource} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Equipment Name *</Label>
                        <Input
                          placeholder="e.g., John Deere Tractor"
                          value={resourceForm.name}
                          onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Type *</Label>
                        <Select
                          value={resourceForm.type}
                          onValueChange={(value) => setResourceForm({ ...resourceForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tractor">Tractor</SelectItem>
                            <SelectItem value="harvester">Harvester</SelectItem>
                            <SelectItem value="planter">Planter</SelectItem>
                            <SelectItem value="sprayer">Sprayer</SelectItem>
                            <SelectItem value="cultivator">Cultivator</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Price per Day (₹) *</Label>
                        <Input
                          type="number"
                          placeholder="2500"
                          value={resourceForm.pricePerDay}
                          onChange={(e) => setResourceForm({ ...resourceForm, pricePerDay: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Capacity *</Label>
                        <Input
                          placeholder="e.g., 50 HP"
                          value={resourceForm.capacity}
                          onChange={(e) => setResourceForm({ ...resourceForm, capacity: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Location *</Label>
                        <Input
                          placeholder="e.g., Ludhiana, Punjab"
                          value={resourceForm.location}
                          onChange={(e) => setResourceForm({ ...resourceForm, location: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Latitude (Optional)</Label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="30.9010"
                          value={resourceForm.latitude}
                          onChange={(e) => setResourceForm({ ...resourceForm, latitude: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Longitude (Optional)</Label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="75.8573"
                          value={resourceForm.longitude}
                          onChange={(e) => setResourceForm({ ...resourceForm, longitude: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe your equipment, features, condition, etc."
                          value={resourceForm.description}
                          onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">Add Equipment</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : myResources.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myResources.map((resource) => (
                  <Card key={resource.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{resource.name}</CardTitle>
                        <Badge variant={
                          resource.status === 'verified' ? 'default' :
                          resource.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {resource.status}
                        </Badge>
                      </div>
                      <CardDescription>{resource.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Location:</span>
                          <span>{resource.location}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Capacity:</span>
                          <span>{resource.capacity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price/Day:</span>
                          <span className="font-bold text-green-600">₹{resource.pricePerDay}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No equipment listed yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start earning by listing your agricultural equipment
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Equipment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>Manage booking requests for your equipment</CardDescription>
              </CardHeader>
              <CardContent>
                {myBookings.length > 0 ? (
                  <div className="space-y-4">
                    {myBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">Booking #{booking.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Resource ID: {booking.resourceId} • {booking.cropType}
                            </p>
                            <p className="text-sm">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'pending' ? 'secondary' :
                              booking.status === 'completed' ? 'outline' : 'destructive'
                            }>
                              {booking.status}
                            </Badge>
                            <p className="text-lg font-bold mt-2">₹{booking.totalPrice}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleBookingAction(booking.id, 'confirmed')}
                              >
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleBookingAction(booking.id, 'cancelled')}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button 
                              size="sm"
                              onClick={() => handleBookingAction(booking.id, 'completed')}
                            >
                              Mark Complete
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenChat(booking.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No booking requests yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Chat Dialog */}
      {selectedBookingForChat && (
        <ChatDialog
          bookingId={selectedBookingForChat}
          open={chatOpen}
          onOpenChange={setChatOpen}
          otherUserName="Farmer"
        />
      )}
    </div>
  );
}

export default function OwnerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <OwnerDashboardContent />
    </ProtectedRoute>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tractor, MapPin, Calendar, MessageSquare, LogOut, Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ChatDialog from '@/components/ChatDialog';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

interface Resource {
  id: number;
  name: string;
  type: string;
  pricePerDay: number;
  location: string;
  capacity: string;
  imageUrl: string;
  ownerId: number;
  latitude: number;
  longitude: number;
}

interface Booking {
  id: number;
  resourceId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  cropType: string;
  farmStage: string;
}

function FarmerDashboardContent() {
  const { userData } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('find');
  
  // ML Form State
  const [mlForm, setMlForm] = useState({
    cropType: '',
    farmStage: '',
    cropWeight: '',
  });
  const [recommendations, setRecommendations] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  // Booking State
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Booking Form State
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
  });

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState<number | null>(null);

  useEffect(() => {
    fetchVerifiedResources();
    fetchMyBookings();
  }, []);

  const fetchVerifiedResources = async () => {
    try {
      const response = await fetch('/api/resources?status=verified&limit=100');
      const data = await response.json();
      setAllResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchMyBookings = async () => {
    if (!userData) return;
    setLoadingBookings(true);
    try {
      const response = await fetch(`/api/bookings?farmerId=${userData.id}&limit=100`);
      const data = await response.json();
      setMyBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleMLRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRecommendations(true);

    try {
      // Call ML API (mock for now)
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlForm),
      });

      if (response.ok) {
        const mlData = await response.json();
        // Filter resources based on ML recommendations
        const filtered = allResources.filter(r => 
          mlData.recommendedTypes.includes(r.type)
        );
        setRecommendations(filtered);
      } else {
        // Fallback: show all verified resources
        setRecommendations(allResources);
      }
    } catch (error) {
      console.error('ML API error, showing all resources:', error);
      setRecommendations(allResources);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleBookResource = async (resource: Resource) => {
    if (!bookingForm.startDate || !bookingForm.endDate) {
      alert('Please select start and end dates');
      return;
    }

    const days = Math.ceil(
      (new Date(bookingForm.endDate).getTime() - new Date(bookingForm.startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const totalPrice = days * resource.pricePerDay;

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: userData?.id,
          resourceId: resource.id,
          ownerId: resource.ownerId,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate,
          totalPrice,
          cropType: mlForm.cropType,
          farmStage: mlForm.farmStage,
          cropWeight: mlForm.cropWeight,
        }),
      });

      if (response.ok) {
        alert('Booking created successfully!');
        setSelectedResource(null);
        fetchMyBookings();
        setActiveTab('bookings');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Tractor className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AgriGo Farmer</h1>
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
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="find">Find Equipment</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Equipment Recommendations</CardTitle>
                <CardDescription>
                  Tell us about your farming needs and we'll recommend the best equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMLRecommendation} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Crop Type</Label>
                      <Select
                        value={mlForm.cropType}
                        onValueChange={(value) => setMlForm({ ...mlForm, cropType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wheat">Wheat</SelectItem>
                          <SelectItem value="rice">Rice</SelectItem>
                          <SelectItem value="corn">Corn</SelectItem>
                          <SelectItem value="cotton">Cotton</SelectItem>
                          <SelectItem value="sugarcane">Sugarcane</SelectItem>
                          <SelectItem value="potato">Potato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Farm Stage</Label>
                      <Select
                        value={mlForm.farmStage}
                        onValueChange={(value) => setMlForm({ ...mlForm, farmStage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="land-preparation">Land Preparation</SelectItem>
                          <SelectItem value="sowing">Sowing</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="harvesting">Harvesting</SelectItem>
                          <SelectItem value="post-harvest">Post Harvest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Expected Crop Weight</Label>
                      <Input
                        placeholder="e.g., 1000 kg"
                        value={mlForm.cropWeight}
                        onChange={(e) => setMlForm({ ...mlForm, cropWeight: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loadingRecommendations}>
                    {loadingRecommendations ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Recommendations...
                      </>
                    ) : (
                      'Get Recommendations'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {recommendations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Recommended Equipment</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{resource.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {resource.location}
                            </CardDescription>
                          </div>
                          <Badge>{resource.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Capacity:</span>
                            <span className="font-medium">{resource.capacity}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price per day:</span>
                            <span className="font-bold text-green-600">₹{resource.pricePerDay}</span>
                          </div>
                        </div>

                        {selectedResource?.id === resource.id ? (
                          <div className="space-y-3 pt-3 border-t">
                            <div className="space-y-2">
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={bookingForm.startDate}
                                onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={bookingForm.endDate}
                                onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                className="flex-1" 
                                onClick={() => handleBookResource(resource)}
                              >
                                Confirm Booking
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setSelectedResource(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            className="w-full" 
                            onClick={() => setSelectedResource(resource)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Now
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Track all your equipment bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </div>
                ) : myBookings.length > 0 ? (
                  <div className="space-y-4">
                    {myBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Booking #{booking.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.cropType} - {booking.farmStage}
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2"
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
                    No bookings yet. Start by finding equipment!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Available Equipment Near You</CardTitle>
                <CardDescription>View all verified equipment on the map</CardDescription>
              </CardHeader>
              <CardContent>
                <MapView resources={allResources} />
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
          otherUserName="Equipment Owner"
        />
      )}
    </div>
  );
}

export default function FarmerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['farmer']}>
      <FarmerDashboardContent />
    </ProtectedRoute>
  );
}
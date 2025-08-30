"use client"

import { useState, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function PaymentsPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProperties({ limit: 50 })
      
      // Transform properties data for payments table
      const paymentsData = response.properties?.map(property => ({
        id: property._id || property.id,
        header: property.title || `Property in ${property.city}`,
        type: property.propertyType || 'Residential',
        status: property.status === 'Active' ? 'Active' : property.status === 'Sold' ? 'Completed' : 'Pending',
        target: property.price ? `₹${(property.price / 100000).toFixed(1)}L` : 'Price TBD',
        limit: property.brokerName || 'Unknown Broker',
        reviewer: property.city || 'Location TBD',
        createdAt: property.createdAt,
        brokerContact: property.brokerContact || property.contactNumber,
        address: property.location?.address || 'Address not provided'
      })) || []
      
      setProperties(paymentsData)
      setError(null)
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError('Failed to load property data')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const columns = [
    {
      header: "Property",
      accessorKey: "header",
    },
    {
      header: "Type", 
      accessorKey: "type",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.getValue("status")
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : status === 'Completed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        )
      },
    },
    {
      header: "Price",
      accessorKey: "target",
    },
    {
      header: "Broker",
      accessorKey: "limit",
    },
    {
      header: "Location",
      accessorKey: "reviewer",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Property Payments</h1>
              <p className="text-muted-foreground">
                Manage property listings and payment tracking
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchProperties}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md border">
            <DataTable 
              columns={columns}
              data={properties}
              loading={loading}
              searchKey="header"
              searchPlaceholder="Search properties..."
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
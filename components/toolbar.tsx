"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Wifi,
  Grid3X3,
  MapPin,
  Ruler,
  Edit3,
  QrCode,
  Settings,
  Trash2,
  Copy,
  RotateCcw,
  Layers,
  ChevronDown,
  Pentagon,
  Upload,
  X,
  Download,
  FileText,
} from "lucide-react"
import { useNavigationStore } from "@/lib/store"
import { useRef, useState } from "react"
import { CustomDropdown } from "./custom-dropdown"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { QrLocationDialog } from "./qr-location-dialog"

// Mock data - in a real app, this would come from your API/database
const mockLocations = [
  { id: "1", name: "campus" },
  { id: "2", name: "ozzene campus" },
  { id: "3", name: "downtown office" },
  { id: "4", name: "warehouse facility" },
]

const mockFloors = [
  { id: "1", name: "ozzene campus" },
  { id: "2", name: "ground floor" },
  { id: "3", name: "second floor" },
  { id: "4", name: "basement" },
]

export function Toolbar() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState("campus")
  const [selectedFloor, setSelectedFloor] = useState("ozzene campus")
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const {
    currentTool,
    currentPolygon,
    backgroundImageUrl,
    showGrid,
    setCurrentTool,
    completePolygon,
    setBackgroundImage,
    clearAll,
    mappingData,
    exportMappingData,
    hasMappingData,
  } = useNavigationStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleToolClick = (toolName: string) => {
    setCurrentTool(currentTool === toolName ? null : toolName)
  }

  const handleCompletePolygon = () => {
    completePolygon()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type.startsWith("image/") || file.name.endsWith(".svg"))) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          setBackgroundImage(img, e.target?.result as string)
        }
        img.onerror = () => {
          alert("Failed to load image. Please try a different file.")
        }
        img.src = e.target?.result as string
      }
      reader.onerror = () => {
        alert("Failed to read file. Please try again.")
      }
      reader.readAsDataURL(file)
    } else {
      alert("Please select a valid image file (PNG, JPG, GIF, SVG)")
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveBackground = () => {
    setBackgroundImage(null, null)
  }

  const handleLocationSelect = (location: { id: string; name: string }) => {
    setSelectedLocation(location.name)
  }

  const handleFloorSelect = (floor: { id: string; name: string }) => {
    setSelectedFloor(floor.name)
  }

  const handleAddLocation = () => {
    // Redirect to add location page
    router.push("/add-location")
  }

  const handleAddFloor = () => {
    // Redirect to add floor page
    router.push("/add-floor")
  }

  const handleExportData = async (format: "json" | "xml") => {
    setIsExporting(true)
    try {
      const data = exportMappingData(format)
      const blob = new Blob([data], {
        type: format === "json" ? "application/json" : "application/xml",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `floor-plan-mapping.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert("Failed to export mapping data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Top section with location/floor selectors */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <CustomDropdown
            label="Location"
            value={selectedLocation}
            options={mockLocations}
            onSelect={handleLocationSelect}
            onAdd={handleAddLocation}
            addLabel="Add Location"
            placeholder="Search locations..."
          />

          <CustomDropdown
            label="Floor"
            value={selectedFloor}
            options={mockFloors}
            onSelect={handleFloorSelect}
            onAdd={handleAddFloor}
            addLabel="Add Floor"
            placeholder="Search floors..."
          />

          {/* Background Image Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Floor Plan</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              onChange={handleImageUpload}
              className="hidden"
              title="Upload floor plan image"
              placeholder="Choose floor plan image"
            />
            <Button
              variant="default"
              size="sm"
              className="h-7 px-2 text-xs bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Floor Plan"
            >
              <Upload className="w-3 h-3 mr-1" />
              {backgroundImageUrl ? "Change" : "Upload"}
            </Button>

            {/* Export Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 px-2 text-xs ${
                    hasMappingData()
                      ? "border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                      : "border-gray-300 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!hasMappingData() || isExporting}
                  title={hasMappingData() ? "Export mapping data" : "No mapping data to export"}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-32">
                <DropdownMenuItem onClick={() => handleExportData("json")}>
                  <FileText className="w-3 h-3 mr-2" />
                  JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData("xml")}>
                  <FileText className="w-3 h-3 mr-2" />
                  XML
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {backgroundImageUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs hover:bg-gray-100 text-red-600 hover:text-red-700"
                onClick={handleRemoveBackground}
                title="Delete Floor Plan"
              >
                <X className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section with tools */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Create section */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-600 font-medium">Create</span>
          <div className="flex items-center gap-1">
            <Button
              variant={currentTool === "wifi" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => handleToolClick("wifi")}
              title="Place WiFi Beacon"
            >
              <Wifi className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant={showGrid ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => handleToolClick("grid")}
              title="Toggle Grid Overlay"
            >
              <Grid3X3 className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant={currentTool === "location" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => handleToolClick("location")}
              title="Add Venue"
            >
              <MapPin className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant={currentTool === "measure" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => handleToolClick("measure")}
              title="Measure Tool"
            >
              <Ruler className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant={currentTool === "path" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => handleToolClick("path")}
              title="Draw Path"
            >
              <Edit3 className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant={currentTool === "polygon" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => handleToolClick("polygon")}
              title="Draw Polygon"
            >
              <Pentagon className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant={qrModalOpen ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => setQrModalOpen(true)}
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant={currentTool === "settings" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => handleToolClick("settings")}
              title="Settings"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Edit section */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-600 font-medium">Edit</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => {
                // This will be handled by the canvas component to copy selected items
                handleToolClick("copy")
              }}
              title="Copy Selected"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => {
                // This will be handled by the canvas component to delete selected items
                handleToolClick("delete")
              }}
              title="Delete Selected"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100" title="Undo">
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Applications and Layers */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Applications</span>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-gray-100">
              <span className="text-gray-700">Apps</span>
              <ChevronDown className="w-3 h-3 ml-1 text-gray-500" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Layers</span>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-gray-100">
              <Layers className="w-3 h-3 mr-1 text-gray-600" />
              <span className="text-gray-700">Layers</span>
              <ChevronDown className="w-3 h-3 ml-1 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tool status indicator */}
      {currentTool && (
        <div className="px-4 py-1 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between">
          <span className="text-xs text-yellow-700 font-medium">
            {currentTool === "wifi" && "Click anywhere to place WiFi beacon"}
            {currentTool === "location" && "Click anywhere to add venue"}
            {currentTool === "measure" && "Click anywhere to measure distance"}
            {currentTool === "path" && "Click anywhere to draw navigation path"}
            {currentTool === "polygon" &&
              (currentPolygon.length === 0
                ? "Click anywhere to start drawing polygon"
                : `Click to add point (${currentPolygon.length} points) • Double-click or press Complete to finish`)}
            {currentTool === "qr" && "Click anywhere to place QR code"}
            {currentTool === "settings" && "Click anywhere to add settings marker"}
            {currentTool === "delete" && "Click on an item to delete it"}
            {currentTool === "copy" && "Click on an item to copy it"}
          </span>

          {currentTool === "polygon" && currentPolygon.length >= 3 && (
            <Button size="sm" className="h-6 px-2 text-xs" onClick={handleCompletePolygon}>
              Complete Polygon
            </Button>
          )}
        </div>
      )}

      {/* Grid status indicator */}
      {showGrid && (
        <div className="px-4 py-1 bg-yellow-50 border-b border-yellow-200">
          <span className="text-xs text-yellow-700 font-medium">Grid overlay is active</span>
        </div>
      )}

       <QrLocationDialog mappingData={mappingData}>
        <Button 
          variant="outline"
          size="sm"
          onClick={()=>{
            console.log(mappingData)

            return setQrModalOpen(true)
          }}
        >
          <QrCode className="h-4 w-4" />
          QR Code
        </Button>
      </QrLocationDialog>
    </div>
  )
}

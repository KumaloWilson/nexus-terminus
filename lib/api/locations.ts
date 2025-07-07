import { supabase } from "@/lib/supabase/client"
import { config } from "@/lib/config/env"
import { generateUUID } from "@/lib/utils/uuid"
import { apiClient } from "@/lib/api/client"
import { type AxiosResponse } from "axios"

export interface LocationRequest {
  uuid: string
  locationName: string
  jsonUrl: string
}

export interface LocationResponse {
  success: boolean
  message: string
  data?: any
}

export interface UploadMappingRequest {
  locationName: string
  mappingData: any
}

export class LocationAPI {
  static async uploadMappingData(request: UploadMappingRequest): Promise<string> {
    try {
      // Generate UUID for location
      const uuid = generateUUID()

      // Create JSON file content
      const jsonContent = {
        uuid,
        locationName: request.locationName,
        mappingData: request.mappingData,
        createdAt: new Date().toISOString(),
      }

      // Convert to blob
      const jsonBlob = new Blob([JSON.stringify(jsonContent, null, 2)], {
        type: "application/json",
      })

      // Upload to Supabase storage
      const fileName = `locations/${uuid}.json`
      const { data, error } = await supabase.storage.from("mappings").upload(fileName, jsonBlob, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("mappings").getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error("Error uploading mapping data:", error)
      throw error
    }
  }

  static async addLocation(request: LocationRequest): Promise<LocationResponse> {
    try {
      const response: AxiosResponse<LocationResponse> = await apiClient.post("/add-location", request)
      return response.data
    } catch (error) {
      console.error("Error adding location:", error)
      throw error
    }
  }

  static async getLocation(uuid: string): Promise<LocationResponse> {
    try {
      const response: AxiosResponse<LocationResponse> = await apiClient.get(`/location/${uuid}`)
      return response.data
    } catch (error) {
      console.error("Error getting location:", error)
      throw error
    }
  }

  static async getAllLocations(): Promise<LocationResponse> {
    try {
      const response: AxiosResponse<LocationResponse> = await apiClient.get("/locations")
      return response.data
    } catch (error) {
      console.error("Error getting all locations:", error)
      throw error
    }
  }
}
"use client"
import { ScrapeAndStoreProducts } from "@/lib/actions";
import { FormEvent, useState } from "react"

const isValidAmazonProductUrl = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if(
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.") ||
      hostname.includes("amazon")
    ) {
      return true
    }
  } catch (error) {
    return false
  }
  return false
}



const SearchBar = () => {
    const [searchPrompt, setSearchPrompt] = useState("")

    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const isValidLink = isValidAmazonProductUrl(searchPrompt);

      if(!isValidLink) return alert("Please provide a valid Amazon link")

      try {
        setIsLoading(true);

        const product = await ScrapeAndStoreProducts(searchPrompt);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }

    }

  return (
    <form
        className='flex flex-wrap gap-4 mt-12'
        onSubmit={handleSubmit}
    >
        <input 
            type="text"
            value={searchPrompt}
            onChange={(e) => {setSearchPrompt(e.target.value)}}
            placeholder="Enter product link"
            className="searchbar-input"
        />
        <button 
          type="submit" 
          className="searchbar-btn" 
          disabled={searchPrompt === ""}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
    </form>
  )
}

export default SearchBar
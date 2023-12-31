import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice, extractDescription } from "../utils";
import { ImageResponse } from "next/server";

export async function scrapeAmazonProduct(url: string) {
    if(!url) return;

    const username = String(process.env.BRIGHT_USERNAME)
    const password = String(process.env.BRIGHT_PASSWORD)
    const port = 22225
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: "brd.superproxy.io",
        port,
        rejectUnauthorized: false
    }

    try {
        const response = await axios.get(url, options);

        const $ = cheerio.load(response.data);

        const title = $("#productTitle").text().trim();

        const currentPrice = extractPrice(
            $(".priceToPay span.a-price-whole"),
            $("a.size.base.a-color-price"),
            $(".a-button-selected .a-color-base"),
        );

        const orginalPrice = extractPrice(
            $("#priceblock_ourprice"),
            $(".a-price.a-text-price span.a-offscreen"),
            $("#list-price"),
            $("#priceblock_dealprice"),
            $(".a-size-base.a-color-price"),
        )

        const outOfStock = $("availability span").text().trim().toLowerCase() === "currently unavailable";

        const images = 
        $("#imgBlkFront").attr("data-a-dynamic-image") ||
        $("#landingImage").attr("data-a-dynamic-image") ||
        "{}"

        const imageUrls = Object.keys(JSON.parse(images));

        const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");

        const currency = extractCurrency($(".a-price-symbol"));

        const description = extractDescription($)
        
        const data = {
            url,
            currency: currency || "$",
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(orginalPrice),
            orginalPrice: Number(orginalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: "category",
            reviewsCount: 100,
            stars: 4.5,
            isOutOfStock: outOfStock,
            description,
            lowerPrice: Number(currentPrice) || Number(orginalPrice),
            higestPrice: Number(orginalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(orginalPrice),
            
        }

        return data;

    } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message}`)
    }

}
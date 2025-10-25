// src/services/qrGenerator.ts
import { Pool } from 'pg'
import QRCode from 'qrcode'
import fs from 'fs'

// 1️⃣ Setup database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'scale_cashier_qa',
  password: 'password',
  port: 5432,
})

// 2️⃣ Function to generate QR code for one product
export async function generateProductQR(productId: string) {
  console.log(`Generating QR code for ......${productId}`);
  const client = await pool.connect()
  try {
    // Fetch product info
    const { rows } = await client.query(
        `SELECT id, name, qr_url_data FROM products WHERE id = $1`,
        [productId]
    )

    if (!rows.length) throw new Error('Product not found')
    const product = rows[0]

    // Format data for QR
    const qrDataUrl = product.qr_url_data
    console.log(`QR Data URL: ${qrDataUrl}`)
    // Create QR and save it
    const filePath = `./qrcodes/product_${product.id}-${product.name}.png`
    await QRCode.toFile(filePath, qrDataUrl, { width: 300 })

    console.log(`✅ QR created for ${product.name} at ${filePath}`)
    return filePath
  } catch (err) {
    console.error('❌ Error generating QR:', err)
    return err
  } finally {
    client.release()
  }
}

export async function generateAllProductQRs() {
  const {rows} = await pool.query(`SELECT id, name, qr_url_data
                                   FROM products`)
  try {
    for (const row of rows) {
      await generateProductQR(row.id)
    }
    console.log('✅ All product QR codes generated.')
    return {message: "QRs generado exitosamente!"}
  } catch (error) {
    console.error(error)
  }
}

// 3️⃣ Example usage
// generateProductQR("4a2d798d-c10b-4167-a8e7-272d686a9b84")
// generateAllProductQRs()

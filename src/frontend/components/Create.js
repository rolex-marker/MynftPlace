import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import axios from 'axios' // make HTTP requests to Pinata

const PINATA_API_KEY = process.env.REACT_APP_PINATA_KEY
const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Upload image to Pinata
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
           maxBodyLength: Infinity,
            timeout: 120000, // ⬅️ 2 minutes
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY
          }
        }
      )

      const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
      console.log("IPFS URL:", url)
      setImage(url)

    } catch (error) {
      console.log("ipfs image upload error:", error)
    }
  }

  // Upload metadata to Pinata
  const createNFT = async () => {
    if (!image || !price || !name || !description) return

    try {
      const metadata = {
        name,
        description,
        image,
        price
      }

      const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY
          }
        }
      )

      const uri = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
      mintThenList(uri)

    } catch (error) {
      console.log("ipfs metadata upload error:", error)
    }
  }

  // Mint NFT and list on marketplace
  const mintThenList = async (uri) => {
    await (await nft.mint(uri)).wait()
    const id = await nft.tokenCount()
    await (await nft.setApprovalForAll(marketplace.address, true)).wait()
    const listingPrice = ethers.utils.parseEther(price.toString())
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control type="file" required onChange={uploadToIPFS} />
              <Form.Control onChange={e => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={e => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={e => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Create
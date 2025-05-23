import type { GetStaticPaths, GetStaticProps } from "next"
import Image from "next/image"
import Head from "next/head"
import type Stripe from "stripe"
import { useShoppingCart } from "use-shopping-cart"

import { stripe } from "../../lib/stripe"
import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product"
import Button from "../../components/Button"

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    description: string;
    defaultPriceId: string;
  }
}

export default function Product({ product }: ProductProps) {
  const { addItem } = useShoppingCart()

  return (
    <>
      <Head>
        <title>
          {`${product.name} | Ignite Shop`}
        </title>
      </Head>
    
      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt=""/>
        </ImageContainer>

        <ProductDetails>  
          <h1>{product.name}</h1>
          <span>
            {
              new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              style: 'currency'
              }).format(product.price)
            }
          </span>

          <p>
            {product.description}
          </p> 

          <Button onClick={() => addItem(product)}>
            Colocar na sacola
          </Button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'prod_RxbXAXfbokKg50' } }
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  }) 
  
  console.log(product)

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: price.unit_amount / 100,
        description: product.description,
        defaultPriceId: price.id,
      },
      revalidate: 60 * 60 * 1 //1 hour 
  }
}}
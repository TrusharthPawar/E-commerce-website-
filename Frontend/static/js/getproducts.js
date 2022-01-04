export default async function getproducts(id) {
    let product = await fetch(`/api/product/${id}`);
    let getproduct = await product.json()
    return getproduct
}

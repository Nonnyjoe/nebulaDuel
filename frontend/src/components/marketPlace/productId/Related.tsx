import { Link, useParams } from "react-router-dom";
import { Text } from "../../atom/Text"
import { ListOfProducts } from "../ProductData";
import { ImageWrap } from "../../atom/ImageWrap";


const Related = () => {
    const { id } = useParams()
    const productId = Number(id);

    const relatedProducts = ListOfProducts.filter(item => item.id !== productId);

    return (
        <section className="w-full flex flex-col mb-20 lg:px-8 md:px-6 px-4">
            <Text as='h3' className="text-gray-200 lg:text-4xl md:text-3xl text-2xl uppercase font-extrabold font-barlow">RELATED PRODUCTS</Text>
            <main className="w-full grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-8">
                {
                    relatedProducts.slice(0, 4).map((item) => (
                        <Link to={`/marketplace/${item.id}`} className="w-full rounded-md p-5 border border-myBlack hover:border-gray-500 bg-myBlack" key={item.id}>
                            <div className="w-full flex flex-col gap-4">
                                <ImageWrap image={item.img} alt={item.name} className="w-full h-[250px] overflow-hidden rounded-md" objectStatus="object-cover" />
                                <div className="w-full tinyLine"></div>
                                <div className="w-full flex flex-col gap-1.5">
                                    <div className="w-full flex justify-between items-center">
                                        <Text as='h4' className="text-gray-100 font-bold font-poppins">{item.name}</Text>
                                        <Text as='span' className="text-myGreen font-barlow font-bold">${item.price}</Text>
                                    </div>
                                    <Text as='h4' className="text-xs font-poppins font-medium text-gray-400">{item.category}</Text>
                                </div>
                            </div>
                        </Link>
                    ))
                }
            </main>
        </section>
    )
}

export default Related
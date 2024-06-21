type ImageOwnProps<T extends React.ElementType> = {
    className: string
    image: string
    alt: string
    objectStatus?: string
    as?: T
}

type ImageProps<T extends React.ElementType> = ImageOwnProps<T> & Omit<React.ComponentProps<T>, keyof ImageOwnProps<T>>

export const ImageWrap = <T extends React.ElementType = 'div'>({ className, image, alt, objectStatus, as, ...rest }: ImageProps<T>) => {
    const Component = as || 'div'
    return (
        <Component className={className} {...rest}>
            <img src={image} alt={alt} className={`w-full h-full ${objectStatus}`} />
        </Component>
    )
}
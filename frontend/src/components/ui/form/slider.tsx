import * as ReactSlider from "@radix-ui/react-slider";


export const Slider = ({...props}) => {
    return (
        <ReactSlider.Root
            className="relative flex items-center select-none touch-none w-[200px] h-5"
            {...props}
        >
            <ReactSlider.Track className="bg-gray-300 relative grow rounded-full h-[6px]">
                <ReactSlider.Range className={`absolute  rounded-full h-full ${props.color || 'bg-blue-500'} `} />
            </ReactSlider.Track>
            <ReactSlider.Thumb
                className="block w-5 h-5 bg-white border border-gray-400 rounded-full shadow-md"
                aria-label="Volume"
            />
        </ReactSlider.Root>
    )
}
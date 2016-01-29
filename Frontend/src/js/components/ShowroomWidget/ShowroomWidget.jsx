class ShowroomWidget extends React.Component {
    constructor(props){
        super(props);

        this.state = {
          brands: props.initialData,
          selectedBrand: props.initialData[0]
        }

        this.onShowroomSelected = this.onShowroomSelected.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onShowroomSelected (e,brand) {
        this.setState({selectedBrand:brand});
        e.preventDefault();
        window.open(brand.url, "_self");
    }


    onSubmit (e) {
        e.preventDefault();
        window.open(this.state.selectedBrand.url, "_self");
    }

    render (){
        return(
            <div className="window__small">
                <div className="window__header">
                    <div className="window__title">Select a Bespoke Brand</div>
                </div>
                <div className="window__body hero--selection js-enter-showroom">
                    <div className="hero__brands row">
                        {
                            this.props.initialData.map((brand) =>
                                <div key={brand.name} className="col-xs-6 col-sm-3">
                                    <div className="hero__brand">
                                        <a onClick={(e) => this.onShowroomSelected(e, brand)} style={{cursor: "pointer"}} title={`View ${brand.name} cars`} target="_blank">
                                            <img src={brand.image}/>
                                        </a>
                                    </div>
                                </div>
                        )}
                    </div>

                </div>
            </div>
        );
    }
}

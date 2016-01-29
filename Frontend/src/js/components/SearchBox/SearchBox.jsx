var categories = {
  ALL: 'all',
  NEW: 'new',
  USED: 'preowned',
  DEMO: 'demo'
}

class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    let category = props.initialListingType;
    if (!category) {
      category = categories.ALL;
    }

    this.state = {
      category,
      year: props.initialYear,
      minPrice: props.initialMinPrice,
      maxPrice: props.initialMaxPrice,
      limit: props.limit,
      sort: props.sort,
      makeModelFilter: '',
      makes: props.initialMakes,
      models: props.initialModels,
      selectedMake: props.initialMake

    };

    //  painful
    this.onCategoryChanged = this.onCategoryChanged.bind(this);
    this.onMakeModelFocussed = this.onMakeModelFocussed.bind(this);
    this.onMakeModelBlurred = this.onMakeModelBlurred.bind(this);
    this.onMakeSelected = this.onMakeSelected.bind(this);
    this.onModelSelected = this.onModelSelected.bind(this);
    this.renderMakeModelSelectors = this.renderMakeModelSelectors.bind(this);
    this.onMakeDeselected = this.onMakeDeselected.bind(this);
    this.onModelDeselected = this.onModelDeselected.bind(this);
    this.onFormSubmitted = this.onFormSubmitted.bind(this);
    this.onMakeModelChanged = this.onMakeModelChanged.bind(this);
    this.onYearRangeChanged = this.onYearRangeChanged.bind(this);
    this.onMinPriceChanged = this.onMinPriceChanged.bind(this);
    this.onMaxPriceChanged = this.onMaxPriceChanged.bind(this);
  }

  componentDidMount () {
    let state = {};
    if (this.props.initialMake) {
      let selectedMake = this.state.makes.find((element) => {
        if(element.key.toLowerCase() === this.props.initialMake.toLowerCase()) {
          return true;
        }
      });
      if (selectedMake) {
        state.selectedMake = selectedMake;
      }
    }

    if (this.props.initialModel) {
      let selectedModel = this.state.models.find((element) => {
        if(element.key.toLowerCase() === this.props.initialModel.toLowerCase()) {
          return true;
        }
      });
      if (selectedModel) {
        state.selectedModel = selectedModel;
      }
    }

    if(!this.state.models && this.state.selectedMake) {
      let modelsUrl = this.props.fetchModelsUrl + "?make=" + this.state.selectedMake.value;
      this.http(modelsUrl).then((response) => {
        let models = JSON.parse(response);
        state.models = models;

        console.log(state.models);

        if (this.props.initialModel) {
          let selectedModel = models.find((element) => {
            if(element.key.toLowerCase() === this.props.initialModel.toLowerCase()) {
              return true;
            }
          });
          state.selectedModel = selectedModel;
        }
      });
    }

    this.setState(state);
  }

  http (url, method = 'GET') {return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {resolve(xhr.response);} else {reject({status: this.status, statusText: xhr.statusText});}
      };
      xhr.onerror = function() {
        reject({status: this.status, statusText: xhr.statusText});
      };
      xhr.send();
    });}

  onCategoryChanged (e) {
    let category = e.currentTarget.value;
    let makesUrl = this.props.fetchMakesUrl + "?listingtype=" + category;
    this.http(makesUrl).then((response) => {
      let makes = JSON.parse(response);
      this.setState({makes, category, selectedMake: null, selectedModel: null, year: null, minPrice: null, maxPrice: null});
    });
  }

  onMakeModelFocussed (e) {this.setState({makeModelFocussed: true});}

  onMakeModelBlurred (e) {setTimeout(() => {
      let makeModelInput = this.refs.makeModelInput;
      makeModelInput.value = "";

      this.setState({makeModelFocussed: false, makeModelFilter: ""});
    }, 150);}

  onMakeSelected (selectedMake) {

    if(selectedMake) {
      let url = this.props.fetchModelsUrl + "?make=" + selectedMake.value + "&listingtype=" + this.state.category;
      this.http(url).then((response) => {
        let models = JSON.parse(response);
        this.setState({selectedMake, models});
      });
    }
  }

  onModelSelected (selectedModel) {this.setState({selectedModel});}

  onMakeDeselected (e) {this.setState({selectedMake: null, selectedModel: null});}

  onModelDeselected (e) {this.setState({selectedModel: null});}

  onFormSubmitted (e) {
    e.preventDefault();

    //  Set className on submit button
    this.setState({submitting: true});

    let url = this.props.fetchSearchUrl + "?";

    if (this.state.selectedMake) {
      url += "&make=" + this.state.selectedMake.value;

      if (this.state.selectedModel) {
        url += "&model=" + this.state.selectedModel.value;
      }
    }

    if (this.state.category) {
      url += "&listingtype=" + this.state.category;
    }

    if (this.state.year) {
      url += "&year=" + this.state.year;
    }

    if (this.state.minPrice) {
      url += "&minprice=" + this.state.minPrice;
    }

    if (this.state.maxPrice) {
      url += "&maxprice=" + this.state.maxPrice;
    }

    if (this.props.limit) {
      url += "&limit=" + this.state.limit;
    }

    if (this.props.sort) {
      url += "&sort=" + this.state.sort;
    }

    this.http(url).then((response) => {
      let result = JSON.parse(response);
      window.location = result.searchUrl;
    });
  }

  onMakeModelChanged (e) {
    let makeModelFilter = e.target.value;
    this.setState({makeModelFilter})
  }

  onYearRangeChanged (e) {this.setState({
      year: e.target.attributes['data-attr'].value
    });}

  onMinPriceChanged (e) {this.setState({minPrice: parseInt(e.target.attributes['data-attr'].value)});}

  onMaxPriceChanged (e) {this.setState({maxPrice: parseInt(e.target.attributes['data-attr'].value)});}

  renderMakeModelSelectors () {
    let clickHandler = null;
    let collection = null;

    if (this.state.selectedMake && this.state.models) {
      collection = this.state.models;
      clickHandler = this.onModelSelected;
    } else if (this.state.makes) {
      collection = this.state.makes;
      clickHandler = this.onMakeSelected;
    } else {
      return <img src={this.props.ajaxLoaderImgSrc} alt="loading" className="loading"/>
    }

    let regexp = new RegExp(this.state.makeModelFilter, "gi");

    return <ul style={this.state.makeModelFocussed
        ? {
          display : 'block'
        }
        : {}}>
        <li>
          <a href="/search" onClick={(e) => {
            e.preventDefault();
            clickHandler();
          }}>Any</a>
        </li>
        {collection.map((item, i) => <li key={item.key} style={!this.state.makeModelFilter || item.key.match(regexp)
          ? {}
          : {
            display : "none"
          }}>
          <a href={item.href} onClick={(e) => {
            e.preventDefault();
            clickHandler(item);
          }}>{item.key + " (" + item.inventoryCount + ")"}</a>
        </li>)}
      </ul>
  }

  render () {
    let selectedMakeText = this.state.selectedMake
      ? this.state.selectedMake.key
      : "";
    let selectedModelText = this.state.selectedModel
      ? this.state.selectedModel.key
      : "";
    return (
      <div className="widget__search">
        <div className="widget__text">We have a fine selection of bespoke luxury vehicles.<br/>
          Step inside to view our collection.
        </div>
        <form className="form__container" onSubmit={this.onFormSubmitted}>
          <div className="row">
            <div className="col-sm-12">
              <div className="widget__search-options">
                <div className="checkradio__container">
                  <input type="radio" name="search_option" id="search_option_all" checked={this.state.category === categories.ALL} onChange={this.onCategoryChanged} value={categories.ALL}/>
                  <label htmlFor="search_option_all">All</label>
                </div>
                <div className="checkradio__container">
                  <input type="radio" name="search_option" id="search_option_new" checked={this.state.category === categories.NEW} onChange={this.onCategoryChanged} value={categories.NEW}/>
                  <label htmlFor="search_option_new">New</label>
                </div>
                <div className="checkradio__container">
                  <input type="radio" name="search_option" id="search_option_demo" checked={this.state.category === categories.DEMO} onChange={this.onCategoryChanged} value={categories.DEMO}/>
                  <label htmlFor="search_option_demo">Demo</label>
                </div>
                <div className="checkradio__container">
                  <input type="radio" name="search_option" id="search_option_used" checked={this.state.category === categories.USED} onChange={this.onCategoryChanged} value={categories.USED}/>
                  <label htmlFor="search_option_used">Preowned</label>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12 col-md-6 col-lg-5">
              <label htmlFor="makeModelInput" className="dropdown__container" style={{
              display: "block"
              }}>
                <div id="search_make_model" className="input__container input__tags">
                  <div className="input__tags-selected" style={{
                  display: this. state. selectedMake || this. state. selectedModel
                      ? "table-cell"
                      : "none"
                  }}>
                    <a className="input__tag selected_make" href="javascript:void(0);" onClick={this.onMakeDeselected} style={{
                    display: this. state. selectedMake
                        ? "inline-block"
                        : "none"
                    }}>{selectedMakeText}</a>

                    <a className="input__tag selected_model" href="javascript:void(0);" onClick={this.onModelDeselected} style={{
                    display: this. state. selectedModel
                        ? "inline-block"
                        : "none"
                    }}>{selectedModelText}</a>
                  </div>
                  <div className="input__tags-textfield" style={{
                  display: this. state. selectedModel
                      ? "none"
                      : "block"
                  }}>
                    <input type="text" ref="makeModelInput" placeholder={this.state.selectedMake
                      ? "Select Model"
                      : "Select Make"} onFocus={this.onMakeModelFocussed} onBlur={this.onMakeModelBlurred} onChange={this.onMakeModelChanged}/>
                  </div>
                </div>
                <div className="dropdown__list make-model load-make" style={this.state.makeModelFocussed
                  ? {
                    opacity : '1',
                    height
                  : 'auto',
                  maxHeight: '600px'
                } : {}}>
                  <div className="dropdown__list-container">
                    {this.renderMakeModelSelectors()}
                  </div>
                </div>
              </label>
            </div>
            <div className="col-sm-12 col-md-6 col-lg-3">
              <div className="dropdown__faux input__container">
                <div className="dropdown-toggle selected-dropdown-option" data-toggle="dropdown" href="#">
                  {(() => {
                    switch(this.state.year) {
                      case "1":
                        return "Up to 1 year old";
                      case "2":
                        return "Up to 2 year old";
                      case "3":
                        return "Up to 3 year old";
                      case "5":
                        return "Up to 5 year old";
                      case "10":
                        return "Up to 10 year old";
                      case "1000":
                        return "Older than 10 years";
                      default:
                        return "Select Year";}
                  })()}
                  <span className="caret"></span>
                </div>
                <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu">
                  <li className={this.state.year == ""
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="" onClick={this.onYearRangeChanged}>Select Year</a>
                  </li>
                  <li className={this.state.year == "1"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="1" onClick={this.onYearRangeChanged}>Up to 1 year old</a>
                  </li>
                  <li className={this.state.year == "2"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="2" onClick={this.onYearRangeChanged}>Up to 2 year old</a>
                  </li>
                  <li className={this.state.year == "3"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="3" onClick={this.onYearRangeChanged}>Up to 3 year old</a>
                  </li>
                  <li className={this.state.year == "5"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="5" onClick={this.onYearRangeChanged}>Up to 5 year old</a>
                  </li>
                  <li className={this.state.year == "10"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="10" onClick={this.onYearRangeChanged}>Up to 10 year old</a>
                  </li>
                  <li className={this.state.year == "1000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="1000" onClick={this.onYearRangeChanged}>Older than 10 years</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-sm-12 col-md-6 col-lg-2">
              <div className="dropdown__faux input__container">
                <div className="dropdown-toggle selected-dropdown-option" data-toggle="dropdown" href="#">
                  {(() => {
                    switch(this.state.minPrice) {
                      case 10000:
                        return "$10,000";
                      case 15000:
                        return "$15,000";
                      case 20000:
                        return "$20,000";
                      case 25000:
                        return "$25,000";
                      case 30000:
                        return "$30,000";
                      case 35000:
                        return "$35,000";
                      case 40000:
                        return "$40,000";
                      case 45000:
                        return "$45,000";
                      case 50000:
                        return "$50,000";
                      case 60000:
                        return "$60,000";
                      case 70000:
                        return "$70,000";
                      case 80000:
                        return "$80,000";
                      case 90000:
                        return "$90,000";
                      case 100000:
                        return "$100,000";
                      case 150000:
                        return "$150,000";
                      case 200000:
                        return "$200,000";
                      case 250000:
                        return "$250,000";
                      case 300000:
                        return "$300,000";
                      default:
                        return "Min Price";}
                  })()}
                  <span className="caret"></span>
                </div>
                <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu">
                  <li className={!this.state.minPrice
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="" onClick={this.onMinPriceChanged}>Min Price</a>
                  </li>
                  <li className={this.state.minPrice == "10000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="10000" onClick={this.onMinPriceChanged}>$10,000</a>
                  </li>
                  <li className={this.state.minPrice == "15000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="15000" onClick={this.onMinPriceChanged}>$15,000</a>
                  </li>
                  <li className={this.state.minPrice == "20000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="20000" onClick={this.onMinPriceChanged}>$20,000</a>
                  </li>
                  <li className={this.state.minPrice == "25000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="25000" onClick={this.onMinPriceChanged}>$25,000</a>
                  </li>
                  <li className={this.state.minPrice == "30000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="30000" onClick={this.onMinPriceChanged}>$30,000</a>
                  </li>
                  <li className={this.state.minPrice == "35000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="35000" onClick={this.onMinPriceChanged}>$35,000</a>
                  </li>
                  <li className={this.state.minPrice == "40000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="40000" onClick={this.onMinPriceChanged}>$40,000</a>
                  </li>
                  <li className={this.state.minPrice == "45000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="45000" onClick={this.onMinPriceChanged}>$45,000</a>
                  </li>
                  <li className={this.state.minPrice == "50000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="50000" onClick={this.onMinPriceChanged}>$50,000</a>
                  </li>
                  <li className={this.state.minPrice == "60000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="60000" onClick={this.onMinPriceChanged}>$60,000</a>
                  </li>
                  <li className={this.state.minPrice == "70000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="70000" onClick={this.onMinPriceChanged}>$70,000</a>
                  </li>
                  <li className={this.state.minPrice == "80000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="80000" onClick={this.onMinPriceChanged}>$80,000</a>
                  </li>
                  <li className={this.state.minPrice == "90000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="90000" onClick={this.onMinPriceChanged}>$90,000</a>
                  </li>
                  <li className={this.state.minPrice == "100000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="100000" onClick={this.onMinPriceChanged}>$100,000</a>
                  </li>
                  <li className={this.state.minPrice == "150000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="150000" onClick={this.onMinPriceChanged}>$150,000</a>
                  </li>
                  <li className={this.state.minPrice == "200000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="200000" onClick={this.onMinPriceChanged}>$200,000</a>
                  </li>
                  <li className={this.state.minPrice == "250000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="250000" onClick={this.onMinPriceChanged}>$250,000</a>
                  </li>
                  <li className={this.state.minPrice == "300000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="300000" onClick={this.onMinPriceChanged}>$300,000</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-sm-12 col-md-6 col-lg-2">
              <div className="dropdown__faux input__container">
                <div className="dropdown-toggle selected-dropdown-option" data-toggle="dropdown" href="#">
                  {(() => {
                    switch(this.state.maxPrice) {
                      case 10000:
                        return "$10,000";
                      case 15000:
                        return "$15,000";
                      case 20000:
                        return "$20,000";
                      case 25000:
                        return "$25,000";
                      case 30000:
                        return "$30,000";
                      case 35000:
                        return "$35,000";
                      case 40000:
                        return "$40,000";
                      case 45000:
                        return "$45,000";
                      case 50000:
                        return "$50,000";
                      case 60000:
                        return "$60,000";
                      case 70000:
                        return "$70,000";
                      case 80000:
                        return "$80,000";
                      case 90000:
                        return "$90,000";
                      case 100000:
                        return "$100,000";
                      case 150000:
                        return "$150,000";
                      case 200000:
                        return "$200,000";
                      case 250000:
                        return "$250,000";
                      case 300000:
                        return "$300,000";
                      default:
                        return "Max Price";}
                  })()}
                  <span className="caret"></span>
                </div>
                <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu">
                  <li className={!this.state.maxPrice
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="" onClick={this.onMaxPriceChanged}>Max Price</a>
                  </li>
                  <li className={this.state.maxPrice == "10000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="10000" onClick={this.onMaxPriceChanged}>$10,000</a>
                  </li>
                  <li className={this.state.maxPrice == "15000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="15000" onClick={this.onMaxPriceChanged}>$15,000</a>
                  </li>
                  <li className={this.state.maxPrice == "20000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="20000" onClick={this.onMaxPriceChanged}>$20,000</a>
                  </li>
                  <li className={this.state.maxPrice == "25000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="25000" onClick={this.onMaxPriceChanged}>$25,000</a>
                  </li>
                  <li className={this.state.maxPrice == "30000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="30000" onClick={this.onMaxPriceChanged}>$30,000</a>
                  </li>
                  <li className={this.state.maxPrice == "35000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="35000" onClick={this.onMaxPriceChanged}>$35,000</a>
                  </li>
                  <li className={this.state.maxPrice == "40000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="40000" onClick={this.onMaxPriceChanged}>$40,000</a>
                  </li>
                  <li className={this.state.maxPrice == "45000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="45000" onClick={this.onMaxPriceChanged}>$45,000</a>
                  </li>
                  <li className={this.state.maxPrice == "50000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="50000" onClick={this.onMaxPriceChanged}>$50,000</a>
                  </li>
                  <li className={this.state.maxPrice == "60000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="60000" onClick={this.onMaxPriceChanged}>$60,000</a>
                  </li>
                  <li className={this.state.maxPrice == "70000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="70000" onClick={this.onMaxPriceChanged}>$70,000</a>
                  </li>
                  <li className={this.state.maxPrice == "80000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="80000" onClick={this.onMaxPriceChanged}>$80,000</a>
                  </li>
                  <li className={this.state.maxPrice == "90000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="90000" onClick={this.onMaxPriceChanged}>$90,000</a>
                  </li>
                  <li className={this.state.maxPrice == "100000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="100000" onClick={this.onMaxPriceChanged}>$100,000</a>
                  </li>
                  <li className={this.state.maxPrice == "150000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="150000" onClick={this.onMaxPriceChanged}>$150,000</a>
                  </li>
                  <li className={this.state.maxPrice == "200000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="200000" onClick={this.onMaxPriceChanged}>$200,000</a>
                  </li>
                  <li className={this.state.maxPrice == "250000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="250000" onClick={this.onMaxPriceChanged}>$250,000</a>
                  </li>
                  <li className={this.state.maxPrice == "300000"
                    ? "active-dropdown-option"
                    : ""}>
                    <a href="javascript:;" data-attr="300000" onClick={this.onMaxPriceChanged}>$300,000</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="input__controller">
                <span className={"loader__button " + (this.state.submitting
                  ? "is--loading"
                  : "")}>
                  <button className="btn btn-primary btn--full">Search</button>
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
};

SearchBox.propTypes = {
  fetchMakesUrl: React.PropTypes.string.isRequired,
  fetchModelsUrl: React.PropTypes.string.isRequired,
  fetchSearchUrl: React.PropTypes.string.isRequired,
  ajaxLoaderImgSrc: React.PropTypes.string.isRequired,
  initialListingType: React.PropTypes.string,
  initialMake: React.PropTypes.string,
  initialModel: React.PropTypes.string,
  initialMinPrice: React.PropTypes.number,
  initialMaxPrice: React.PropTypes.number,
  initialYear: React.PropTypes.string,
  initialMakes: React.PropTypes.array,
  sort: React.PropTypes.string,
  limit: React.PropTypes.string
};

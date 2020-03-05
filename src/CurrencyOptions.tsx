import React from 'react'
import CurrencyRow from './CurrencyRow'
import Flag from './Flag'
import SyncIcon from '@material-ui/icons/Sync'
import EUR from './assets/EUR.svg'

interface Props {
}
interface State {
    error: null
    isLoaded: boolean
    amountInFromCurrency: boolean
    options: string[]
    fromCurrency: string
    toCurrency: string
    amount: number
    exchangeRate: number
    fromFlag: string
    toFlag: string
    isToggleOn: boolean
}
export default class CurrencyOptions extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            error: null,
            isLoaded: false,
            amountInFromCurrency: true,
            options: [],
            fromCurrency: '',
            toCurrency: '',
            amount: 1,
            exchangeRate: 1,
            fromFlag: '',
            toFlag: '',
            isToggleOn: true
        }
    }

    async componentDidMount() {
        try {
            const responses = await Promise.all([
                fetch(`https://api.exchangeratesapi.io/latest`),
                fetch('https://restcountries.eu/rest/v2/all?fields=name;currencies;flag')])
            const dataArray = await Promise.all(responses.map((res) => res.json()))
            const defaultCurrency = await Object.keys(dataArray[0].rates)[0]

            await this.setState({
                isLoaded: true,
                fromCurrency: dataArray[0].base,
                toCurrency: defaultCurrency,
                options: [...Object.keys(dataArray[0].rates), dataArray[0].base],
                exchangeRate: (dataArray[0].rates[defaultCurrency]),

            })

            await this.setState({

                fromFlag: this.currency2flag(this.state.fromCurrency, dataArray[1]),
                toFlag: this.currency2flag(this.state.toCurrency, dataArray[1])

            })

        }
        catch (error) {
            this.setState({
                isLoaded: true,
                error
            })
            console.log(error);
        }
    }

    currency2flag(currency: string, dataSet: any[]) {
        let flag;
        switch (currency) {
            case 'AUD':
                flag = dataSet.find((element: { name: string }) => element.name === 'Australia').flag
                break;
            case 'USD':
                flag = (dataSet.find((element: { name: string }) => element.name === 'United States of America')).flag
                break;
            case 'CHF':
                flag = dataSet.find((element: { name: string }) => element.name === 'Switzerland').flag
                break;
            case 'EUR':
                flag = EUR
                break;
            default:
                flag = dataSet.find((element: { currencies: { code: string }[] }) => element.currencies[0].code === currency).flag
        }
        return flag
    }

    handleClick(event: { preventDefault: () => void }) {
        event.preventDefault()
        this.setState(state => ({
            isToggleOn: !state.isToggleOn
        }));
        console.log(this.state.isToggleOn)
    }
    async update(fromCurrency: string | null, toCurrency: string | null) {
        if (fromCurrency != null && toCurrency != null) {
            try {
                const responses = await Promise.all([
                    fetch(`https://api.exchangeratesapi.io/latest?base=${fromCurrency}&symbols=${toCurrency}`),
                    fetch('https://restcountries.eu/rest/v2/all?fields=name;currencies;flag')])
                const dataArray = await Promise.all(responses.map((res) => res.json()))

                this.setState({
                    exchangeRate: (dataArray[0].rates[toCurrency]),
                    fromFlag: this.currency2flag(fromCurrency, dataArray[1]),
                    toFlag: this.currency2flag(toCurrency, dataArray[1])
                })

            } catch (error) {
                console.log(error)
            }
        }
    }

    changeCurrency = (event: { target: { name: string; value: string } }) => {
        if (event.target.name === "from") {
            this.setState({ fromCurrency: event.target.value })
            this.update(event.target.value, this.state.toCurrency)
        }
        if (event.target.name === "to") {
            this.setState({ toCurrency: event.target.value })
            this.update(this.state.fromCurrency, event.target.value)
        }
    }

    changeAmount = (event: { target: { name: string; value: number } }) => {
        if (event.target.name === "fromInput") {
            this.setState({
                amount: event.target.value,
                amountInFromCurrency: true
            })
        }
        if (event.target.name === "toInput") {
            this.setState({
                amount: event.target.value,
                amountInFromCurrency: false
            })
        }

    }

    render() {
        if (this.state.error) {
            return <div>Error</div>
        } else if (!this.state.isLoaded) {
            return <div>Loading...</div>
        }

        else {
            let fromAmount: number, toAmount: number
            if (this.state.amountInFromCurrency) {
                fromAmount = this.state.amount
                toAmount = this.state.amount * this.state.exchangeRate
            }
            else {
                toAmount = this.state.amount
                fromAmount = this.state.amount / this.state.exchangeRate
            }

            return (
                // <div className={`${this.state.isToggleOn ? 'container' : 'invert'}`}>
                <div style= {this.state.isToggleOn ? {...container}:{...inverted}}> 
                    <Flag
                        flagImage={this.state.fromFlag}
                    />
                    <CurrencyRow
                        name={'from'}
                        nameInput={'fromInput'}
                        currencyOptions={(this.state.options)}
                        selectedCurrency={this.state.fromCurrency}
                        onChangeCurrency={(event) => this.changeCurrency(event)}
                        onChangeAmount={(event) => this.changeAmount(event)}
                        amount={fromAmount}
                    />
                    <SyncIcon onClick={(event) => this.handleClick(event)} />
                    <CurrencyRow
                        name={'to'}
                        nameInput={'toInput'}
                        currencyOptions={(this.state.options)}
                        selectedCurrency={this.state.toCurrency}
                        onChangeCurrency={(event) => this.changeCurrency(event)}
                        onChangeAmount={(event) => this.changeAmount(event)}
                        amount={toAmount}
                    />
                    <Flag
                        flagImage={this.state.toFlag}
                    />
                </div >)
        }
    }
}

const container: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    margin: '0.5em',
    justifyContent: 'center',
    alignItems: 'center',
}
const inverted: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    margin: '0.5em',
    justifyContent: 'center',
    alignItems: 'center',
}

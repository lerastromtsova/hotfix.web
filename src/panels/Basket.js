import React, { useMemo, useState, useEffect } from 'react';
import { withRouter, Link } from 'react-router-dom';
import accounting from 'accounting';

import Checkbox from './Checkbox';

import edit from '../img/edit.svg';
import './place.css';

// safari polyfill
function normalizeTime(value) {
  let time = value.replace(/[^0-9]+/g, '');
  time = ("0000" + time).slice(-4);
  return `${time.slice(0, 2)}:${time.slice(2)}`
}

function validateTime(value) {
  if (/^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/.test(value)){
    return value
  } 
  return '23:59'
}

function saveOrderDetails(data) {
  window.localStorage.setItem('____orderDetails', JSON.stringify(data));
}

const DEFAULT_ORDER_DATA = {
  faster: true, time: '', selfService: false
}

function loadOrderDetails() {
  const rawData = window.localStorage.getItem('____orderDetails');
  if (rawData) {
    return JSON.parse(rawData);
  }
  return DEFAULT_ORDER_DATA
}


const Basket = ({ match: { params: { areaId, itemId }}, foodAreas, order }) => {
  const [ faster, setFaster ] = useState(true);
  const [ time, setTime ] = useState('');
  const [ selfService, setSelfService ] = useState(false);

  useEffect(() => {
    const { faster, time, selfService } = loadOrderDetails();
    setFaster(faster);
    setTime(time);
    setSelfService(selfService);
  }, []);



  const area = foodAreas.filter(area => area.id === areaId)[0];
  const item = area.items.filter(item => item.id === itemId)[0];

  const [ price, products ] = useMemo(() => {
    const foodIds = new Set((item.foods || []).map(item => item.id));

    const products = Object.values(order)
      .filter((value) => {
        const { item: { id }} = value;

        return foodIds.has(id);
      });

    const result = products.reduce((result, value) => {
        const { count, item } = value;

        return result + parseInt(item.price) * parseInt(count);
      }, 0);

    return [ accounting.formatNumber(result, 0, ' '), products ];
  }, [ order, item ]);

  return (
    <div className="Place">
      <header className="Place__header">
        <aside className="Place__trz">
          <h1 className="Place__head">
            <Link to="/" className="Place__logo">
              {area.name}
            </Link>
          </h1>
          <Link to="/edit" className="Place__change-tz">
            <img
              alt="change-profile"
              src={edit}
            />
          </Link>
        </aside>
      </header>
      <aside className="Place__restoraunt">
        <img
          className="Place__restoraunt-logo"
          alt="Fastfood logo"
          src={item.image}
        />
        <h2
          className="Place__restoraunt-name"
        >
          {item.name}
        </h2>
        <p className="Place__restoraunt-type">
          {item.description}
        </p>
      </aside>
      <div className="Place__products-wrapper">
        <ul className="Place__products">
          {products.map(({ item, count }) => (
            <li
              className="Place__product"
              key={item.id}
            >
              <img
                className="Place__product-logo"
                alt="Ordered product logo"
                src={item.image}
              />
              <h3
                className="Place__product-name"
              >
                {item.name}
              </h3>
              <p
                className="Place__product-price"
              >
                Цена: {item.price}
              </p>
              <p
                className="Place__product-count"
              >
                x{count}
              </p>
            </li>
          ))}
        </ul>
        <Link
          className="Place__change-product"
          to={`/place/${areaId}/${itemId}`}
          onClick={() => saveOrderDetails({ faster, time, selfService })}
        >
          Изменить
        </Link>
      </div>
      <div className="Place__choice">
        <h3>Время:</h3>
        <div className="Place__choice-item">
          <span>Как можно быстрее</span>
          <Checkbox 
            checked={faster} 
            onToggle={() => {
              if (faster) {
                setFaster(false);
              } else {
                setTime('');
                setFaster(true);
              }
            }}
          />
        </div>
        <div className="Place__choice-item">
          <span>Назначить</span>
          <input
            value={time}
            type="text"
            onFocus={() => {
              setFaster(false);
            }}
            onChange={event => {
              setFaster(false);
              const time = validateTime(normalizeTime(event.target.value));
              setTime(time);
            }}
            onBlur={() => {
              if (time) {
                setFaster(false);
              }
            }}
          />
        </div>
        <div className="Place__choice-item">
          <h3>С собой</h3>
          <Checkbox checked={selfService} onToggle={() => setSelfService(!selfService)} />
        </div>
        <div className="Place__choice-item">
          <h3>На месте</h3>
          <Checkbox checked={!selfService} onToggle={() => setSelfService(!setSelfService)} />
        </div>
      </div>
      <footer className="Place__footer">
        <Link 
          to={`/order/${area.id}/${item.id}`} 
          className="Place__order" 
          onClick={() => saveOrderDetails(DEFAULT_ORDER_DATA)}
        >
          Оплатить {price}
        </Link>
      </footer>
    </div>
  );
};

export default withRouter(Basket);

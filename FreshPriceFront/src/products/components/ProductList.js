import React, { useEffect, useState, useContext } from 'react';
import { useParams , Link } from 'react-router-dom';
import Card from '../../shared/components/UIElements/Card';
import ProductItem from './ProductItem';
import Button from '../../shared/components/FormElements/Button';
import './ProductList.css';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import waiting from './waiting.gif'

const ProductList = props => {

  const { sendRequest } = useHttpClient();
  let params = useParams();
  const [loadedPlaceCreator, setLoadedPlaceCreator] = useState();
  //const [loadedPlace, setLoadedPlace] = useState();
  const placeId = useParams().placeId;
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/places/${placeId}`
        );
        //console.log(responseData);
        setLoadedPlaceCreator(responseData.place.creator);
        //setLoadedPlace(responseData.place.creator); 
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlace();
  }, [sendRequest, placeId]);




  if (props.items.length === 0 && auth.userId === loadedPlaceCreator) {
    return (
      <div className="product-list center">
        <Card>
          <h2>No products found. Maybe create one?</h2>
          <Button to={`/${params.placeId}/products/new`}>New Product</Button>
        </Card>
      </div>
    );
  }
  else if (props.items.length === 0) {
    return (
      <div className="gif ">
        <img  src={waiting} alt="no product"/>
        <h2>oops no product found</h2>
        <Button className='link' to={"/"}>go back home</Button>
      </div>
  );
  }
  else {
    return (
      <div>
        <ul className="product-list">
          {props.items.map(product => (
            <ProductItem
              key={product.id}
              id={product.id}
              image={product.image}
              name={product.name}
              description={product.description}
              price={product.price}
              discount={product.discount}
              newPrice={product.newPrice.toFixed(2)}
              creatorId={product.creator}
              creatorUser={product.creatorUser}
              onDelete={props.onDeleteProduct}
            />
          ))}
        </ul>

        {((auth.userId === loadedPlaceCreator) ||(auth.userRole === "admin")) &&
          <div className="product-list center">
            <Button to={`/${placeId}/products/new`}>New Product</Button>
          </div>}
      </div>
    );
          }
  };
export default ProductList;

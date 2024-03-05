import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './ProductForm.css';

const NewProduct = () => {

  const auth = useContext(AuthContext);
  const placeIdParams = useParams().placeId;
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlaceCreator, setLoadedPlaceCreator] = useState();

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/places/${placeIdParams}`
        );
        setLoadedPlaceCreator(responseData.place.creator);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlace();
  }, [sendRequest, placeIdParams]);

  const [formState, inputHandler] = useForm(
    {
      name: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      price: {
        value: '',
        isValid: false
      },
      discount: {
        value: '',
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );

  const navigate = useNavigate();
  const productSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', formState.inputs.name.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('price', formState.inputs.price.value);
      formData.append('discount', formState.inputs.discount.value);
      formData.append('image', formState.inputs.image.value);
      formData.append('creator', placeIdParams);
      formData.append('creatorUser', loadedPlaceCreator);
      await sendRequest('http://localhost:5000/api/products', 'POST', formData, {
        Authorization: 'Bearer ' + auth.token
      });
      navigate('/' + placeIdParams +'/products')
    } catch (err) { }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="product-form" onSubmit={productSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="name"
          element="input"
          type="text"
          label="Name"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid name."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)."
          onInput={inputHandler}
        />
        <Input
          id="price"
          element="input"
          label="Price"
          type="number"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid price."
          onInput={inputHandler}
        />
        <Input
          id="discount"
          element="input"
          label="Discount"
          type="number"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid discount."
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          onInput={inputHandler}
          errorText="Please provide an image."
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PRODUCT
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewProduct;
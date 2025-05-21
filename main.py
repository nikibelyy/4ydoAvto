from aiogram import Bot, Dispatcher, types
from aiogram.types import InputFile
from aiogram.utils import executor
from aiogram.dispatcher import FSMContext
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.dispatcher.filters.state import State, StatesGroup
import os

API_TOKEN = os.getenv("API_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID"))

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot, storage=MemoryStorage())

class SellCar(StatesGroup):
    photo = State()
    brand = State()
    year = State()
    mileage = State()
    price = State()

@dp.message_handler(commands=['start'])
async def start_cmd(message: types.Message):
    await message.answer("Привет! Я бот Чудо Авто. Хочешь продать машину? Нажми /sell")

@dp.message_handler(commands=['sell'])
async def sell_cmd(message: types.Message):
    await SellCar.photo.set()
    await message.answer("Отправьте фото автомобиля")

@dp.message_handler(content_types=['photo'], state=SellCar.photo)
async def get_photo(message: types.Message, state: FSMContext):
    await state.update_data(photo=message.photo[-1].file_id)
    await SellCar.next()
    await message.answer("Укажите марку автомобиля")

@dp.message_handler(state=SellCar.brand)
async def get_brand(message: types.Message, state: FSMContext):
    await state.update_data(brand=message.text)
    await SellCar.next()
    await message.answer("Год выпуска?")

@dp.message_handler(state=SellCar.year)
async def get_year(message: types.Message, state: FSMContext):
    await state.update_data(year=message.text)
    await SellCar.next()
    await message.answer("Пробег?")

@dp.message_handler(state=SellCar.mileage)
async def get_mileage(message: types.Message, state: FSMContext):
    await state.update_data(mileage=message.text)
    await SellCar.next()
    await message.answer("Укажите желаемую цену")

@dp.message_handler(state=SellCar.price)
async def get_price(message: types.Message, state: FSMContext):
    user_data = await state.get_data()
    await message.answer("Спасибо! Заявка отправлена на проверку.")

    caption = (
        f"Новая заявка от @{message.from_user.username or 'пользователь'}:
"
        f"Марка: {user_data['brand']}
"
        f"Год: {user_data['year']}
"
        f"Пробег: {user_data['mileage']}
"
        f"Цена: {message.text}"
    )

    await bot.send_photo(chat_id=ADMIN_ID, photo=user_data['photo'], caption=caption)
    await state.finish()

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
